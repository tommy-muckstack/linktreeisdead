import { LinkEditor } from "@/components/admin/LinkEditor";
export default async function EditLink({ params }: { params: Promise<{ id: string }> }) { return <LinkEditor id={(await params).id} />; }
