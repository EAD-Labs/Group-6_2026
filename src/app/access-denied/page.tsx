import Link from "next/link";
import { Brand } from "@/components/ui/brand";
export const metadata = { title: "Staff access" };
export default function AccessDeniedPage() {
  return <main className="public-document" id="main-content"><Brand /><span className="eyebrow">Staff workspace</span><h1>This page needs a staff account.</h1><p>Administration is available to the programme’s assigned facilitators, content managers and administrators. Guided practice and participant accounts can continue with the course.</p><p>If you have a staff role, sign in with the account your programme administrator assigned. Ask them to check your role or cohort assignment if access is still unavailable.</p><div className="platform-actions"><Link href="/dashboard" className="button button-primary">Return to learning</Link><Link href="/sign-in" className="button button-secondary">Open sign in</Link><Link href="/help" className="text-link">User guide</Link></div></main>;
}
