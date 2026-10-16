import { notFound, redirect } from "next/navigation";
import { cookies, headers } from "next/headers";
import Script from "next/script";
import type { Metadata } from "next";
import { getPage, recordView } from "@/lib/pages";
import { isLive } from "@/lib/model";
import { visitFrom } from "@/lib/visit";
import { publicView, pageLockCookie, pageLockValue } from "@/lib/publicpage";
import { PageView } from "@/components/page/PageView";
import { PageLock } from "@/components/page/PageLock";
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ handle: string }> }): Promise<Metadata> {
  const p = await getPage((await params).handle); if (!p) return { title: "Not found" };
  const title = p.settings.seo.title || `${p.title} | LinktreeIsDead`; const description = p.settings.seo.description || p.bio || `Links from ${p.title}`;
  return { title, description, robots: p.settings.seo.noindex ? { index: false, follow: false } : undefined, openGraph: { title, description, type: "profile" } };
}
export default async function PublicPage({ params }: { params: Promise<{ handle: string }> }) {
  const { handle } = await params; const p = await getPage(handle); if (!p) notFound();
  const fwd = p.links.find(l => l.redirect && l.type === "link" && l.url && isLive(l) && l.lock.kind === "none");
  if (fwd) redirect(`/go/${p.handle}/${fwd.id}`);
  if (p.settings.lock.enabled && p.settings.lock.code) {
    const c = (await cookies()).get(pageLockCookie(p.handle))?.value;
    if (c !== pageLockValue(p.handle, p.settings.lock.code)) return <PageLock handle={p.handle} />;
  }
  const h = await headers(); await recordView(handle, visitFrom(h, h.get("host") ?? "") ?? undefined);
  const { google: ga, facebook: fb } = p.settings.pixels;
  return <>
    {ga && <><Script src={`https://www.googletagmanager.com/gtag/js?id=${ga}`} strategy="afterInteractive" /><Script id="ga" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag('js',new Date());gtag('config','${ga}');`}</Script></>}
    {fb && <Script id="fbp" strategy="afterInteractive">{`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${fb}');fbq('track','PageView');`}</Script>}
    <PageView page={publicView(p)} mode="live" />
  </>;
}
