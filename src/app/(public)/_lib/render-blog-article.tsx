import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
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
  audio_url: string | null;
  video_url: string | null;
  youtube_id: string | null;
  slide_image_urls: string[] | null;
  author: string;
  published_at: string | null;
  updated_at: string;
}

async function fetchArticle(kind: Kind, slug: string): Promise<BlogArticleRow | null> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await (supabase as any)
    .from("blog_articles")
    .select(
      "slug,kind,title,description,body_html,content,image_url,meta_title,meta_description,canonical_url,og_title,og_description,og_image,tags,schema_json,faq_json,sources_json,audio_url,video_url,youtube_id,slide_image_urls,author,published_at,updated_at",
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

export async function renderBlogArticle(kind: Kind, slug: string) {
  const article = await fetchArticle(kind, slug);
  if (!article) notFound();

  const url = article.canonical_url || `${SITE}/${kind}/${article.slug}`;
  const kindLabel = kind === "insights" ? "Insights" : "Comparisons";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE },
      { "@type": "ListItem", position: 2, name: kindLabel, item: `${SITE}/${kind}` },
      { "@type": "ListItem", position: 3, name: article.title, item: url },
    ],
  };

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
    <article className="container mx-auto max-w-3xl px-4 py-10 sm:py-14">
      {article.schema_json ? <JsonLd data={article.schema_json} /> : null}
      <JsonLd data={breadcrumbSchema} />
      {faqSchema ? <JsonLd data={faqSchema} /> : null}

      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span className="mx-2">/</span>
        <Link href={`/${kind}`} className="hover:text-foreground">{kindLabel}</Link>
      </nav>

      <header className="mb-8">
        <h1 className="font-display text-3xl sm:text-4xl font-bold leading-tight tracking-tight text-foreground">
          {article.title}
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">{article.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
          <span>By {article.author}</span>
          <span aria-hidden>·</span>
          <time dateTime={article.published_at || article.updated_at}>
            {new Date(article.published_at || article.updated_at).toLocaleDateString("en-US", {
              year: "numeric", month: "long", day: "numeric",
            })}
          </time>
          {article.updated_at && article.updated_at !== article.published_at ? (
            <>
              <span aria-hidden>·</span>
              <span>Updated {new Date(article.updated_at).toLocaleDateString("en-US", {
                year: "numeric", month: "short", day: "numeric",
              })}</span>
            </>
          ) : null}
        </div>
      </header>

      {article.video_url || article.youtube_id ? (
        <div className="mb-8 overflow-hidden rounded-xl border bg-muted">
          {article.youtube_id ? (
            <iframe
              src={`https://www.youtube.com/embed/${article.youtube_id}`}
              title={article.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="aspect-video w-full"
            />
          ) : (
            <video controls className="w-full" preload="metadata" src={article.video_url || undefined} />
          )}
        </div>
      ) : article.audio_url ? (
        <div className="mb-8">
          <audio controls preload="metadata" src={article.audio_url} className="w-full" />
        </div>
      ) : article.image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={article.image_url} alt="" className="mb-8 w-full rounded-xl border" />
      ) : null}

      <div
        className="article-html-content prose prose-neutral max-w-none dark:prose-invert"
        dangerouslySetInnerHTML={{ __html: article.body_html || article.content }}
      />

      {article.sources_json && article.sources_json.length ? (
        <section className="mt-12 border-t pt-8">
          <h2 className="text-xl font-semibold">Sources</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            {article.sources_json.map((s, i) => (
              <li key={i}>
                <a href={s.url} target="_blank" rel="noopener nofollow" className="underline hover:text-foreground">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </article>
  );
}
