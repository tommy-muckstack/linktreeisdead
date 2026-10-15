import { MeasuredPage } from "@/components/m/MeasuredPage";
import pm from "@/components/m/pricing390.json";

// Phone layout (<=900px) measured from linktr.ee/s/pricing at 390px; the desktop markup below it is hidden at that width.
const CROSS = '<svg viewBox="0 0 20 20" width="100%" height="100%" fill="none" stroke="#9a9d93" stroke-width="1.4" stroke-linecap="round"><circle cx="10" cy="10" r="7.5" stroke="#cfd1c8"/><path d="M7.5 7.5l5 5M12.5 7.5l-5 5"/></svg>';
export function PricingMobile() {
  return <MeasuredPage data={pm as never} className="lt-pm" img={(it) => it.w <= 20 && it.alt === "x" ? <div style={{ width: it.w, height: it.h }} dangerouslySetInnerHTML={{ __html: CROSS }} /> : null} />;
}
