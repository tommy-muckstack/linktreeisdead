import { InfoPage, infoMeta } from "@/components/InfoPage";
export const metadata = infoMeta("about");
export default function Page() { return <InfoPage slug="about" />; }
