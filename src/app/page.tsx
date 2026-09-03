import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page-shell">
      <section className="hero" aria-labelledby="home-title">
        <span className="eyebrow">AI literacy for educators</span>
        <h1 id="home-title">Build useful classroom prompts with confidence.</h1>
        <p>
          PromptShala is a practice-first learning pathway for teachers who are
          beginning to use generative AI.
        </p>
        <div className="button-row">
          <Link className="button button-primary" href="/sign-in">
            Sign in
          </Link>
          <Link className="button button-secondary" href="/learn/module-1">
            Preview Module 1
          </Link>
        </div>
      </section>

      <section className="feature-grid" aria-label="Learning pathway">
        <article className="card">
          <span className="step-number">01</span>
          <h2>Understand AI</h2>
          <p>Recognise useful, responsible classroom applications.</p>
        </article>
        <article className="card">
          <span className="step-number">02</span>
          <h2>Practise prompts</h2>
          <p>Write, receive visible feedback, and revise.</p>
        </article>
        <article className="card">
          <span className="step-number">03</span>
          <h2>Reuse workflows</h2>
          <p>Build assistants and source-grounded classroom resources.</p>
        </article>
      </section>
    </main>
  );
}
