import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "../sign-in/actions";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect("/sign-in");
  }

  return (
    <main className="page-shell">
      <header className="dashboard-header">
        <div>
          <span className="eyebrow">Participant dashboard</span>
          <h1>Continue learning</h1>
        </div>
        <form action={signOut}>
          <button className="button button-secondary" type="submit">
            Sign out
          </button>
        </form>
      </header>
      <section className="card module-card">
        <span className="step-number">Module 1</span>
        <h2>AI Foundations and Responsible Use</h2>
        <p>Recognise useful classroom applications and review AI output safely.</p>
        <Link className="button button-primary" href="/learn/module-1">
          Start Module 1
        </Link>
      </section>
    </main>
  );
}
