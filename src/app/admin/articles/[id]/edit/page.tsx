"use client";

import ArticleEditor from "@/components/admin/ArticleEditor";
import { useParams } from "next/navigation";

export default function EditArticlePage() {
  const params = useParams();
  return <ArticleEditor id={params.id as string} />;
}
