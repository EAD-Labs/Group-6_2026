import type { Metadata } from "next";
import Link from "next/link";
import { PendingSubmit } from "@/components/ui/pending-submit";

import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";

import { getSafePostAuthPath } from "@/features/auth/authorization";

import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
};

const errorMessages: Record<string, string> = {
  callback: "The sign-in link could not be verified. Please try again.",
  configuration:
    "Account services are temporarily unavailable. Please try again shortly.",
  unconfirmed: "Confirm your email using the link sent when you registered, then sign in.",
  invalid: "The email or password was not recognised.",
  missing: "Enter both your email and password.",
};

type SignInPageProps = {
  searchParams: Promise<{ error?: string; next?: string; passwordUpdated?: string; deleted?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error, next, passwordUpdated, deleted } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <div className="auth-page paper-grid">
      <header className="auth-header">
        <Brand />
        <span className="secure-label"><Icon name="shield" /> Teacher pilot</span>
      </header>
      <main className="auth-layout" id="main-content">
        <section className="auth-story" aria-labelledby="sign-in-title">
          <span className="eyebrow">Welcome back</span>
          <h1 id="sign-in-title">A practical place to learn AI for teaching.</h1>
          <p>Short activities. Classroom examples. Clear feedback. Your professional judgment stays in control.</p>
          <blockquote>
            “I want to save preparation time without sending unverified content to my learners.”
            <cite>A fictional teacher scenario used in this course</cite>
          </blockquote>
        </section>
        <section className="auth-card" aria-label="Participant sign in">
          <div className="auth-card-heading">
            <span className="brand-mark" aria-hidden="true">प</span>
            <div><h2>Continue learning</h2><p>Sign in with your email and password.</p></div>
          </div>
          {passwordUpdated === "1" ? <p className="platform-message" role="status">Password updated. Sign in with your new password.</p> : deleted === "1" ? <p className="platform-message" role="status">Your account and learning data have been deleted.</p> : null}
          {errorMessage ? <p id="sign-in-error" className="error-message" role="alert"><Icon name="info" />{errorMessage}</p> : null}
          <form action={signIn} className="form-stack" aria-describedby={errorMessage ? "sign-in-error" : undefined}>
            <input type="hidden" name="next" value={getSafePostAuthPath(next ?? null)} />
            <label>Email address<input autoComplete="email" name="email" placeholder="teacher@school.edu" required type="email" /></label>
            <label>Password<input autoComplete="current-password" minLength={8} name="password" placeholder="At least 8 characters" required type="password" /></label>
            <PendingSubmit pendingLabel="Signing in…">Sign in</PendingSubmit>
          </form>
          <Link className="text-link" href="/account-recovery">Forgot your password?</Link>
          <p>New here? <Link className="text-link" href="/sign-up">Create your account</Link></p>
          <p className="form-note"><Icon name="shield" />Your progress is saved to your own account. Every module is open for the pilot.</p>
        </section>
      </main>
      <footer className="auth-footer"><Link href="/privacy">Privacy and safe use</Link><Link href="/help">Need help?</Link><span>© 2026 PromptShala</span></footer>
    </div>
  );
}
