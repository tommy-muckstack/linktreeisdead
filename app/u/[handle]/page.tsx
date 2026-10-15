import { notFound } from "next/navigation";
import { getPage, recordView } from "@/lib/pages";
import { PagePreview } from "@/components/PagePreview";
import { BP } from "@/lib/basepath";
import type { Metadata } from "next";
export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = await getPage((await params).handle); return p ? { title: `${p.title} | LinktreeIsDead`, description: p.bio } : { title: "Not found" };
}
export default async function PublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params; const p = await getPage(handle); if (!p) notFound();
  await recordView(handle);
  return <PagePreview page={p} hrefFor={id => `${BP}/go/${p.handle}/${id}`} />;
}
