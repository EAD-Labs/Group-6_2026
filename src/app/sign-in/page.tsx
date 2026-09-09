import type { Metadata } from "next";

import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";

import { signIn, startPresentationDemo } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
};

const errorMessages: Record<string, string> = {
  callback: "The sign-in link could not be verified. Please try again.",
  configuration:
    "Live pilot authentication is not configured in this environment. Use the presentation demo below.",
  invalid: "The email or password was not recognised.",
  missing: "Enter both your email and password.",
};

type SignInPageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { error } = await searchParams;
  const errorMessage = error ? errorMessages[error] : undefined;

  return (
    <div className="auth-page paper-grid">
      <header className="auth-header">
        <Brand />
        <span className="secure-label"><Icon name="shield" /> Invitation-only pilot</span>
      </header>
      <main className="auth-layout" id="main-content">
        <section className="auth-story" aria-labelledby="sign-in-title">
          <span className="eyebrow">Welcome back</span>
          <h1 id="sign-in-title">A practical place to learn AI for teaching.</h1>
          <p>Short activities. Classroom examples. Clear feedback. Your professional judgment stays in control.</p>
          <blockquote>
            “I want to save preparation time without sending unverified content to my learners.”
            <cite>Meera · Class 6–8 science teacher</cite>
          </blockquote>
        </section>
        <section className="auth-card" aria-label="Participant sign in">
          <div className="auth-card-heading">
            <span className="brand-mark" aria-hidden="true">प</span>
            <div><h2>Continue learning</h2><p>Use the account provided by your facilitator.</p></div>
          </div>
          {errorMessage ? <p className="error-message" role="alert"><Icon name="info" />{errorMessage}</p> : null}
          <form action={signIn} className="form-stack">
            <label>Email address<input autoComplete="email" name="email" placeholder="teacher@school.edu" required type="email" /></label>
            <label>Password<input autoComplete="current-password" minLength={8} name="password" placeholder="At least 8 characters" required type="password" /></label>
            <button className="button button-primary button-full" type="submit">Sign in <Icon name="arrow-right" /></button>
          </form>
          <div className="auth-divider"><span>Client presentation</span></div>
          <form action={startPresentationDemo}>
            <button className="button button-demo button-full" type="submit"><Icon name="play" />Open guided demo</button>
          </form>
          <p className="form-note"><Icon name="shield" />Public registration is disabled. The guided demo stores sample progress only on this device.</p>
        </section>
      </main>
      <footer className="auth-footer"><span>Privacy-first by design</span><span>© 2026 PromptShala</span></footer>
    </div>
  );
}
