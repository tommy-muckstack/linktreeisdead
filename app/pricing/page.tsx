import { Landing } from "@/components/Landing";
export const metadata = { title: "Pricing | LinktreeIsDead" };
// One responsive page for every width. (The old 390px layout was measured text from the original page, so it carried
// the original's copy, FAQ and footer; it was dropped in favour of the responsive desktop markup.)
export default function Pricing() { return <Landing page="pricing" />; }
