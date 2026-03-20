"use client";

import ProviderForm from "@/components/admin/ProviderForm";
import { useParams } from "next/navigation";

export default function EditProviderPage() {
  const params = useParams();
  return <ProviderForm id={params.id as string} />;
}
