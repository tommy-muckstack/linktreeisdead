"use client";
import { useEffect, useState } from "react";
import { BP } from "@/lib/basepath";
export type InsightsData = { days: number; series: { day: string; v: number; c: number; uv: number; links: Record<string, number> }[]; totals: { views: number; clicks: number; uv: number; ctr: number; contacts: number }; prev: { views: number; clicks: number; uv: number; ctr: number }; refs: [string, number][]; geo: [string, number][]; dev: [string, number][]; links: { id: string; clicks: number; title: string }[]; lifetime: { views: number; clicks: number; ctr: number; contacts: number } };
export function useInsights(days: number) {
  const [data, setData] = useState<InsightsData | null>(null);
  useEffect(() => { let off = false; setData(null); fetch(`${BP}/api/insights?days=${days}`).then(r => r.json()).then(j => { if (!off) setData(j); }).catch(() => {}); return () => { off = true; }; }, [days]);
  return data;
}
