import Link from "next/link";

import { Brand } from "@/components/ui/brand";
import { Icon } from "@/components/ui/icon";

export default function HomePage() {
  return (
    <div className="marketing-page paper-grid">
      <header className="marketing-header">
        <Brand />
        <Link className="button button-secondary button-small" href="/sign-in">
          Participant sign in
        </Link>
      </header>
      <main id="main-content">
        <section className="marketing-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <span className="eyebrow">Practice-first AI literacy for educators</span>
            <h1 id="home-title">From curious teacher to confident AI user.</h1>
            <p>
              Learn through real classroom decisions, visible feedback and safe practice—not long technical lectures.
            </p>
            <div className="button-row">
              <Link className="button button-primary" href="/sign-in">
                Enter PromptShala <Icon name="arrow-right" />
              </Link>
              <a className="text-link" href="#pathway">
                Explore the pathway
              </a>
            </div>
            <div className="trust-row" aria-label="Product principles">
              <span><Icon name="shield" /> Privacy-first</span>
              <span><Icon name="target" /> Teacher-focused</span>
              <span><Icon name="progress" /> Progress you can see</span>
            </div>
          </div>
          <div className="hero-preview" aria-label="PromptShala learning preview">
            <span className="preview-kicker">Your next 25 minutes</span>
            <div className="preview-header">
              <span className="module-number">01</span>
              <div>
                <h2>AI Foundations</h2>
                <p>Three short lessons and one knowledge check</p>
              </div>
            </div>
            <div className="preview-lesson complete"><Icon name="check" /><span>Meet generative AI</span><small>7 min</small></div>
            <div className="preview-lesson current"><Icon name="play" /><span>Useful teacher tasks</span><small>8 min</small></div>
            <div className="preview-lesson"><Icon name="shield" /><span>Review before use</span><small>8 min</small></div>
            <div className="preview-progress"><span style={{ width: "33%" }} /></div>
            <p className="preview-note">Designed for beginner school teachers</p>
          </div>
        </section>

        <section className="pathway-section" id="pathway" aria-labelledby="pathway-title">
          <span className="eyebrow">A complete classroom pathway</span>
          <h2 id="pathway-title">Learn once. Practise often. Reuse safely.</h2>
          <div className="pathway-grid">
            {[
              ["01", "Understand AI", "Recognise useful tasks, limits and responsible teacher review."],
              ["02", "Write with CRAFT", "Turn a classroom need into a clear, testable prompt."],
              ["03", "Build assistants", "Reuse strong instructions for recurring preparation work."],
              ["04", "Use your sources", "Create grounded drafts from safe, teacher-owned material."],
            ].map(([number, title, description]) => (
              <article className="pathway-card" key={number}>
                <span>{number}</span>
                <h3>{title}</h3>
                <p>{description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
      <footer className="marketing-footer">
        <span>PromptShala · ET-617 Group 6</span>
        <span>Built for a 10-educator pilot</span>
      </footer>
    </div>
  );
}
