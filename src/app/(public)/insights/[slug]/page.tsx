import { buildBlogArticleMetadata, renderBlogArticle } from "../../_lib/render-blog-article";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return buildBlogArticleMetadata("insights", slug);
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return renderBlogArticle("insights", slug);
}
