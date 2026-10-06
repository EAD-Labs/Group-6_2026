import Link from "next/link";
import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";
import { PendingSubmit } from "@/components/ui/pending-submit";
import { signUp } from "./actions";

export const metadata = { title: "Create account" };
const errors: Record<string, string> = {
  name: "Enter your name using 2–100 characters.", email: "Enter a valid email address.",
  password: "Use a password with 12–128 characters.", confirmation: "Your passwords must match.",
  acknowledgement: "Read and acknowledge the pilot data notice to continue.",
  existing: "This email already has an account. Sign in or reset your password.",
  rate: "Too many attempts. Wait a moment before trying again.",
  service: "Account creation is temporarily unavailable. Please try again shortly.",
};
export default async function SignUpPage({ searchParams }: { searchParams: Promise<{ error?: string; sent?: string }> }) {
  const { error, sent } = await searchParams;
  return <div className="auth-page paper-grid"><header className="auth-header"><Brand /><span className="secure-label"><Icon name="shield" />Teacher pilot</span></header>
    <main className="auth-layout" id="main-content"><section className="auth-story"><span className="eyebrow">Make room for practice</span><h1>Learn at your pace. Start anywhere.</h1><p>Create your own account to save lessons, practice and knowledge checks. Every module and chapter is open from the start.</p><p>Your programme administrator can see progress, scores, question attempts and learning activity to improve the pilot.</p><Link className="text-link" href="/privacy">Read how your data is used</Link></section>
    <section className="auth-card" aria-label="Create participant account"><div className="auth-card-heading"><span className="brand-mark" aria-hidden="true">प</span><div><h2>Create your account</h2><p>Use your own email and a password you keep private.</p></div></div>
    {sent === "1" ? <div className="platform-message" role="status"><h3>Check your email</h3><p>If this address is eligible for a new account, a confirmation link is on its way. Check your spam folder too. If you already have an account, sign in.</p><Link className="button button-secondary" href="/sign-in">Go to sign in</Link></div> : <>
    {error ? <p className="error-message" role="alert">{errors[error] ?? errors.service}</p> : null}
    <form className="form-stack" action={signUp}><label>Your name<input name="name" autoComplete="name" minLength={2} maxLength={100} required /></label><label>Email address<input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" required /></label><label>Password<input name="password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><label>Confirm password<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={128} required /></label><p className="form-note">Use at least 12 characters. Your password is securely managed by our authentication service.</p><label className="platform-check"><input name="acknowledgement" type="checkbox" required />I have read the data notice and understand that administrators can review my pilot learning activity.</label><PendingSubmit pendingLabel="Creating account…">Create account</PendingSubmit></form></>}
    <p>Already registered? <Link className="text-link" href="/sign-in">Sign in</Link></p></section></main><footer className="auth-footer"><Link href="/privacy">Privacy and safe use</Link><Link href="/help">Need help?</Link><span>© 2026 PromptShala</span></footer></div>;
}
