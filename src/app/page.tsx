import Link from "next/link";

import { Icon } from "@/components/ui/icon";

const modules = [
  { number: "01", title: "Begin with the basics", topic: "Foundations and responsible use", detail: "See where a draft can help, where it can mislead, and what a teacher must check." },
  { number: "02", title: "Write a better request", topic: "Classroom prompt writing", detail: "Give the task a learning goal, useful context and a way to judge the result." },
  { number: "03", title: "Make good work reusable", topic: "Teacher assistants", detail: "Build a focused assistant, challenge it with difficult cases and repair a weakness." },
  { number: "04", title: "Work from your own material", topic: "Teacher-owned sources", detail: "Use approved notes as evidence and trace important claims back to them." },
];

export default function HomePage() {
  return <div className="editorial-home">
    <header className="editorial-header">
      <div className="editorial-header-inner">
        <Link className="editorial-wordmark" href="/" aria-label="PromptShala home"><span className="editorial-mark" aria-hidden="true" />PromptShala</Link>
        <span className="editorial-header-note">A practice book for educators</span>
        <nav aria-label="Main navigation"><a href="#pathway">The course</a><a href="#experience">How it works</a><Link href="/sign-in">Sign in</Link></nav>
        <Link className="editorial-header-cta" href="/sign-in">Start learning <Icon name="arrow-right" /></Link>
      </div>
    </header>

    <main id="main-content">
      <div className="editorial-masthead"><span>PromptShala / Field notes</span><span>For teachers who want useful work, carefully checked</span><span>01—04 / The learning route</span></div>

      <section className="editorial-opening" aria-labelledby="home-title">
        <aside className="editorial-rail" aria-label="At a glance">
          <div><span className="editorial-small-label">On this page</span><strong>From first question to classroom-ready draft.</strong><p>A short route through the habits behind thoughtful AI use in teaching.</p></div>
          <ol>{modules.map((module) => <li key={module.number}><span>{module.number}</span>{module.topic}</li>)}</ol>
          <p className="editorial-rail-note">Made for real planning time. Keep your judgment in the loop.</p>
        </aside>

        <div className="editorial-opening-main">
          <div className="editorial-intro"><span className="editorial-kicker"><span aria-hidden="true" />A course for tomorrow’s lesson</span><h1 id="home-title">A better first draft.<br /><em>A teacher’s final call.</em></h1><p>Learn to use AI for the work around teaching: planning, questions, explanations and adaptation. Try each idea on a classroom task, check the output and keep what genuinely helps.</p><div className="editorial-actions"><Link className="editorial-primary" href="/sign-in">Open the course <Icon name="arrow-right" /></Link><a href="#pathway">See the four modules</a></div></div>

          <div className="editorial-workbook" aria-label="Example of a classroom prompt being improved">
            <div className="editorial-workbook-head"><span>From the practice book</span><span>Exercise 02 / Prompt repair</span></div>
            <div className="editorial-workbook-grid">
              <div className="editorial-workbook-note"><span className="editorial-small-label">The classroom need</span><p>Class 7 science. Twenty minutes. No projector. Students can describe evaporation but struggle to explain what changes.</p><span className="editorial-margin-note">The details are the work.</span></div>
              <div className="editorial-workbook-example"><div><span className="editorial-small-label">First request</span><p>“Make a lesson on evaporation.”</p></div><div className="editorial-revision"><span className="editorial-small-label">A more useful request</span><p>“Plan a 20-minute Class 7 activity about evaporation using only a board and a cup of water. Start from what pupils already know. End with one question that reveals whether they can explain the change.”</p></div></div>
            </div>
            <div className="editorial-workbook-foot"><span>Context · Action · Format · Target</span><strong>Then check the science, timing and suitability yourself.</strong></div>
          </div>
        </div>
      </section>

      <section className="editorial-pathway" id="pathway" aria-labelledby="pathway-title"><div className="editorial-section-head"><span className="editorial-small-label">The course / 04 modules</span><h2 id="pathway-title">Learn the habit.<br /><em>Keep the useful parts.</em></h2><p>Each module asks you to make something, inspect it and explain what you would change before a learner sees it.</p></div><div className="editorial-module-list">{modules.map((module) => <article key={module.number}><span className="editorial-module-number">{module.number}</span><div><span className="editorial-small-label">{module.topic}</span><h3>{module.title}</h3></div><p>{module.detail}</p><span className="editorial-module-line" aria-hidden="true" /></article>)}</div></section>

      <section className="editorial-method" id="experience" aria-labelledby="experience-title"><div><span className="editorial-small-label">How you learn</span><h2 id="experience-title">Read a little.<br />Try it. Review it.</h2></div><ol><li><span>01 / Understand</span><p>Plain-language lessons connect the idea to a familiar classroom decision.</p></li><li><span>02 / Practise</span><p>Use a prompt lab, a reusable template or the AI Staffroom on a safe example.</p></li><li><span>03 / Decide</span><p>Check accuracy, privacy, learner fit and the changes needed before use.</p></li></ol></section>

      <section className="editorial-principle" id="outcomes"><span className="editorial-small-label">A standing note on the page</span><p>Good teaching does not disappear when a tool helps with the draft. It becomes easier to see where your expertise matters.</p><div><span>Use fictional or general examples in practice.</span><span>Never add identifiable learner information.</span><span>Review every output before classroom use.</span></div></section>

      <section className="editorial-last" aria-labelledby="last-title"><div><span className="editorial-small-label">Begin here</span><h2 id="last-title">Bring a lesson you are already planning.</h2><p>Start with Foundations, then turn one real teaching need into a prompt you can test and improve.</p></div><Link className="editorial-primary" href="/sign-in">Start learning <Icon name="arrow-right" /></Link></section>
    </main>

    <footer className="editorial-footer"><Link className="editorial-wordmark" href="/"><span className="editorial-mark" aria-hidden="true" />PromptShala</Link><span>Practice-first AI literacy for educators</span><span>ET-617 · Group 6</span></footer>
  </div>;
}
