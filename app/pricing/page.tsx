import { Landing } from "@/components/Landing";
import { PricingMobile } from "@/components/PricingMobile";
export const metadata = { title: "Pricing" };
export default function Pricing() { return <><PricingMobile /><div className="mp-desk"><Landing page="pricing" /></div></>; }
