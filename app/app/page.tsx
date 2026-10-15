import { currentUser } from "@/lib/session";
import { ensurePage } from "@/lib/pages";
import { stats } from "@/lib/model";
import { Editor } from "@/components/Editor";
export const dynamic = "force-dynamic";
export default async function AppHome({ searchParams }: { searchParams: Promise<{ handle?: string }> }) {
  const u = (await currentUser())!; const { handle } = await searchParams;
  const page = await ensurePage(u, handle); return <Editor initial={page} initialStats={stats(page)} />;
}
