import type { Metadata } from "next";

import { signIn } from "./actions";

export const metadata: Metadata = {
  title: "Sign in",
};

const errorMessages: Record<string, string> = {
  callback: "The sign-in link could not be verified. Please try again.",
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
    <main className="centered-state">
      <section className="form-card" aria-labelledby="sign-in-title">
        <span className="eyebrow">Ten-user pilot</span>
        <h1 id="sign-in-title">Welcome to PromptShala</h1>
        <p>Use the account provided by the project administrator.</p>
        {errorMessage ? (
          <p className="error-message" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <form action={signIn} className="form-stack">
          <label>
            Email
            <input autoComplete="email" name="email" required type="email" />
          </label>
          <label>
            Password
            <input
              autoComplete="current-password"
              minLength={8}
              name="password"
              required
              type="password"
            />
          </label>
          <button className="button button-primary" type="submit">
            Sign in
          </button>
        </form>
        <p className="form-note">
          Public registration is disabled during the initial pilot.
        </p>
      </section>
    </main>
  );
}
