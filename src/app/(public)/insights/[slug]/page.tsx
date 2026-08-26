import {
  buildBlogArticleMetadata,
  publishedSlugs,
  renderBlogArticle,
} from "../../_lib/render-blog-article";

export const revalidate = 3600;

/**
 * Prerender every published insights article (playbook fix #5). Slugs that
 * 308-redirect are excluded, so the build never emits a URL that redirects.
 * `dynamicParams` stays on by default, so an article published between builds
 * still renders on demand and is then cached by the same 1 hour revalidate.
 */
export async function generateStaticParams() {
  const slugs = await publishedSlugs("insights");
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return buildBlogArticleMetadata("insights", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderBlogArticle("insights", slug);
}
