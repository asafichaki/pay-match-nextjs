import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import ReviewerBioBox from "@/components/ReviewerBioBox";
import { createSupabaseServerClient } from "@/integrations/supabase/server";

type Kind = "insights" | "comparisons";

const SITE = "https://www.mypayadvisor.com";

interface BlogArticleRow {
  slug: string;
  kind: Kind;
  title: string;
  description: string;
  body_html: string | null;
  content: string;
  image_url: string | null;
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image: string | null;
  tags: string[] | null;
  schema_json: unknown;
  faq_json: { question: string; answer: string }[] | null;
  sources_json: { name: string; url: string }[] | null;
  key_findings: string[] | null;
  toc: { id: string; label: string }[] | null;
  eyebrow: string | null;
  audio_url: string | null;
  video_url: string | null;
  youtube_id: string | null;
  slide_image_urls: string[] | null;
  author: string;
  published_at: string | null;
  updated_at: string;
}

const PLACEHOLDER_RE = /\[INTERNAL_LINK:[^\]]*\]/gi;
const FALLBACK_INTERNAL_RE = /\(INTERNAL_LINK:[^)]*\)/gi;

/**
 * Normalize a date-ish value to a strict ISO 8601 string WITH timezone offset,
 * required by Google Rich Results for VideoObject.uploadDate / AudioObject.uploadDate.
 *
 * Returns null when the value is missing, unparseable, or would emit a naked
 * date / offset-less timestamp. Callers MUST gate schema emission on a non-null
 * return value — see render-blog-article.tsx VideoObject + AudioObject blocks.
 *
 * GSC flagged this on 2026-05-27 (missing timezone + invalid datetime on Videos).
 * Gate: scripts/seo/check-video-upload-date.mjs (prebuild).
 */
function toIsoWithOffset(value: string | null | undefined): string | null {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  // Date#toISOString always emits ...Z (UTC) — that satisfies the offset rule.
  return d.toISOString();
}

function sanitizeBody(html: string): string {
  if (!html) return html;
  return html
    .replace(PLACEHOLDER_RE, "")
    .replace(FALLBACK_INTERNAL_RE, "")
    .replace(/[—–]/g, ", ");
}

async function fetchArticle(kind: Kind, slug: string): Promise<BlogArticleRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await (supabase as any)
    .from("blog_articles")
    .select(
      "slug,kind,title,description,body_html,content,image_url,meta_title,meta_description,canonical_url,og_title,og_description,og_image,tags,schema_json,faq_json,sources_json,key_findings,toc,eyebrow,audio_url,video_url,youtube_id,slide_image_urls,author,published_at,updated_at",
    )
    .eq("kind", kind)
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();
  if (error || !data) return null;
  return data as BlogArticleRow;
}

export async function buildBlogArticleMetadata(kind: Kind, slug: string): Promise<Metadata> {
  const article = await fetchArticle(kind, slug);
  if (!article) return { title: "Not found" };
  const url = article.canonical_url || `${SITE}/${kind}/${article.slug}`;
  const title = article.meta_title || article.title;
  const description = article.meta_description || article.description;
  const image = article.og_image || article.image_url || `${SITE}/og-logo.png`;
  return {
    title,
    description,
    alternates: { canonical: url },
    robots: { index: true, follow: true },
    openGraph: {
      type: "article",
      url,
      title: article.og_title || title,
      description: article.og_description || description,
      images: [{ url: image }],
    },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

function readingMinutes(body: string): number {
  const words = (body || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
  return Math.max(3, Math.round(words / 230));
}

function formatDate(d: string): string {
  return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export async function renderBlogArticle(kind: Kind, slug: string) {
  const article = await fetchArticle(kind, slug);
  if (!article) notFound();

  const url = article.canonical_url || `${SITE}/${kind}/${article.slug}`;
  const kindLabel = kind === "insights" ? "Insights" : "Comparisons";
  const eyebrow = article.eyebrow || (kind === "insights" ? "Deep Dive" : "Comparison");
  const minutes = readingMinutes(article.body_html || article.content);
  const cleanBody = sanitizeBody(article.body_html || article.content);

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: kindLabel, item: `${SITE}/${kind}` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

  // Augment schema_json with ImageObject if hero exists, plus Speakable selectors.
  const articleSchema = (() => {
    const base: any = article.schema_json && typeof article.schema_json === "object"
      ? { ...(article.schema_json as object) }
      : null;
    if (!base) return null;
    if (article.image_url) {
      base.image = {
        "@type": "ImageObject",
        url: article.image_url,
        width: 1600,
        height: 900,
      };
    }
    // Speakable: per geo-architect/03-citation-worthy-content.md.
    // h1 is the article title; [data-speakable='true'] tags the lead paragraph
    // and any in-body TL;DR blocks.
    base.speakable = {
      "@type": "SpeakableSpecification",
      cssSelector: ["h1", "[data-speakable='true']"],
    };
    return base;
  })();

  // VideoObject schema — required for Google Indexing API eligibility on non-job URLs.
  // GATE: uploadDate must be ISO 8601 with timezone offset, else GSC errors.
  const videoSchema = (() => {
    if (!article.video_url) return null;
    const uploadDate = toIsoWithOffset(article.published_at || article.updated_at);
    if (!uploadDate) return null; // skip schema rather than emit invalid datetime
    return {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      name: article.title,
      description: article.description,
      thumbnailUrl: article.image_url || `${SITE}/og-logo.png`,
      uploadDate,
      contentUrl: article.video_url,
      embedUrl: article.video_url,
      publisher: {
        "@type": "Organization",
        name: "myPayAdvisor",
        logo: { "@type": "ImageObject", url: `${SITE}/og-logo.png` },
      },
    };
  })();

  // AudioObject schema — always render when audio_url present (NotebookLM podcast).
  // Previously gated on no-video — but multi-modal signals (audio + video both)
  // are net positive for LLM citation per geo-architect § Multimodal patterns.
  const audioSchema = (() => {
    if (!article.audio_url) return null;
    const uploadDate = toIsoWithOffset(article.published_at || article.updated_at);
    if (!uploadDate) return null; // same gate as VideoObject
    return {
      "@context": "https://schema.org",
      "@type": "AudioObject",
      name: `${article.title} — audio overview`,
      description: article.description,
      contentUrl: article.audio_url,
      encodingFormat: "audio/mpeg",
      uploadDate,
      duration: "PT8M",
      publisher: {
        "@type": "Organization",
        name: "myPayAdvisor",
        logo: { "@type": "ImageObject", url: `${SITE}/og-logo.png` },
      },
      isPartOf: { "@id": url },
    };
  })();

  // HowTo schema for deepdive playbook section
  const howToSchema = (() => {
    if (kind !== "insights") return null;
    if (!cleanBody.includes('id="playbook"')) return null;
    const playbookMatch = cleanBody.match(/<section[^>]*id="playbook"[^>]*>([\s\S]*?)<\/section>/i);
    if (!playbookMatch) return null;
    const items = Array.from(playbookMatch[1].matchAll(/<li[^>]*>([\s\S]*?)<\/li>/gi))
      .map((m) => m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim())
      .filter((t) => t.length > 10);
    if (items.length < 3) return null;
    return {
      "@context": "https://schema.org",
      "@type": "HowTo",
      name: article.title,
      description: article.description,
      step: items.map((text, i) => ({
        "@type": "HowToStep",
        position: i + 1,
        name: text.split(/[.:]/)[0].slice(0, 80),
        text,
      })),
    };
  })();

  const faqSchema = article.faq_json && article.faq_json.length
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: article.faq_json.map((q) => ({
          "@type": "Question",
          name: q.question,
          acceptedAnswer: { "@type": "Answer", text: q.answer },
        })),
      }
    : null;

  return (
    <main className="container mx-auto px-4 py-8 lg:py-12">
      {articleSchema ? <JsonLd data={articleSchema} /> : null}
      <JsonLd data={breadcrumbSchema} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}
      {howToSchema ? <JsonLd data={howToSchema} /> : null}
      {videoSchema ? <JsonLd data={videoSchema} /> : null}
      {audioSchema ? <JsonLd data={audioSchema} /> : null}

      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${kind}`} className="hover:text-foreground">{kindLabel}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{article.title}</span>
      </nav>

      <article className="mx-auto max-w-3xl">
        <header className="mb-10 border-b border-border pb-8">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="font-semibold text-primary">{eyebrow}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{minutes} min read</span>
            <span className="text-muted-foreground">·</span>
            <time className="text-muted-foreground" dateTime={article.published_at || article.updated_at}>
              {formatDate(article.published_at || article.updated_at)}
            </time>
            {article.updated_at && article.published_at && article.updated_at.slice(0, 10) !== article.published_at.slice(0, 10) ? (
              <>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">Updated {formatDate(article.updated_at)}</span>
              </>
            ) : null}
          </div>
          <h1 className="font-display text-3xl font-bold leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
            {article.title}
          </h1>
          <p
            data-speakable="true"
            className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl"
          >
            {article.description}
          </p>
          <div className="mt-6 flex items-center gap-3 text-sm">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
              {article.author?.[0] || "M"}
            </div>
            <div>
              <p className="font-semibold text-foreground">{article.author || "myPayAdvisor Editorial"}</p>
              <p className="text-muted-foreground">
                Reviewed by{" "}
                <a href="/about/barak" className="text-primary hover:underline font-medium">
                  Barak Bachar, Global Payments Manager
                </a>
              </p>
            </div>
          </div>
        </header>

        {article.youtube_id ? (
          <div className="mb-8 overflow-hidden rounded-xl border bg-muted">
            <iframe
              src={`https://www.youtube.com/embed/${article.youtube_id}`}
              title={article.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          </div>
        ) : article.video_url ? (
          <div className="mb-8 overflow-hidden rounded-xl border bg-muted">
            <video controls className="w-full" preload="metadata" src={article.video_url} />
          </div>
        ) : article.image_url ? (
          <figure className="mb-8 overflow-hidden rounded-xl border border-border">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={article.image_url} alt={article.title} className="aspect-video w-full object-cover" />
          </figure>
        ) : null}

        {article.audio_url ? (
          <section aria-label="Audio overview" className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-5">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
                Audio overview · 8 min listen
              </p>
              <a
                href={article.audio_url}
                download
                className="text-[11px] sm:text-xs font-semibold text-primary hover:text-primary/80 underline underline-offset-2"
              >
                Download
              </a>
            </div>
            <audio controls preload="metadata" src={article.audio_url} className="w-full" />
          </section>
        ) : null}

        {article.key_findings && article.key_findings.length ? (
          <section className="mb-10 rounded-xl border border-primary/20 bg-primary/5 p-6 sm:p-7">
            <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-primary">Key findings</h2>
            <ul className="space-y-2 text-foreground">
              {article.key_findings.map((k, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-2 h-1.5 w-1.5 flex-none rounded-full bg-primary" />
                  <span dangerouslySetInnerHTML={{ __html: sanitizeBody(k) }} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {article.toc && article.toc.length >= 3 ? (
          <nav aria-label="Table of contents" className="mb-10 rounded-xl bg-muted/50 p-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">In this guide</h2>
            <ol className="grid gap-1.5 text-sm sm:grid-cols-2">
              {article.toc.map((t, i) => (
                <li key={t.id} className="text-muted-foreground">
                  <span className="mr-1 tabular-nums">{i + 1}.</span>
                  <a href={`#${t.id}`} className="text-primary hover:underline">{t.label}</a>
                </li>
              ))}
            </ol>
          </nav>
        ) : null}

        <div className="article-body" dangerouslySetInnerHTML={{ __html: cleanBody }} />

        {article.slide_image_urls && article.slide_image_urls.length ? (
          <section className="mt-12 border-t border-border pt-8">
            <p className="mb-3 text-[11px] sm:text-xs font-bold uppercase tracking-wider text-primary">
              Visual summary
            </p>
            <h2 className="mb-5 text-xl sm:text-2xl font-bold text-foreground">
              The story in three slides.
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {article.slide_image_urls.map((u, i) => (
                <figure key={i} className="overflow-hidden rounded-xl border border-border bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={u} alt={`Slide ${i + 1}`} loading="lazy" className="w-full h-auto" />
                </figure>
              ))}
            </div>
          </section>
        ) : null}

        {article.faq_json && article.faq_json.length ? (
          <section id="faq" className="mt-12 border-t border-border pt-10">
            <h2 className="mb-6 text-2xl font-bold text-foreground sm:text-3xl">Frequently asked questions</h2>
            <div className="space-y-6">
              {article.faq_json.map((q, i) => (
                <div key={i}>
                  <h3 className="mb-2 text-lg font-semibold text-foreground">{q.question}</h3>
                  <p className="text-muted-foreground leading-relaxed">{q.answer}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {article.sources_json && article.sources_json.length ? (
          <section className="mt-12 border-t border-border pt-8">
            <h2 className="mb-3 text-base font-bold uppercase tracking-wider text-muted-foreground">Sources</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {article.sources_json.map((s, i) => (
                <li key={i}>
                  <a href={s.url} target="_blank" rel="noopener nofollow" className="text-primary underline hover:text-primary/80">
                    {s.name}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <ReviewerBioBox linkProfile={false} />
      </article>
    </main>
  );
}
