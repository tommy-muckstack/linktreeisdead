import { AccountDash } from "@/components/admin/AccountDash";
import { firebaseClientConfig, firebaseConfigured } from "@/lib/isdead-auth/config";
export const dynamic = "force-dynamic";
export default function P() { return <AccountDash config={firebaseConfigured() ? firebaseClientConfig() : null} />; }
