import Link from "next/link";

import { Brand } from "@/components/ui/brand";
import { Icon, type IconName } from "@/components/ui/icon";

const pathway = [
  { color: "coral", description: "Recognise useful classroom tasks, limits, bias and the teacher's responsibility to review.", icon: "brain" as IconName, number: "01", title: "Understand AI" },
  { color: "amber", description: "Turn a real teaching need into a clear prompt, then test and improve the result.", icon: "target" as IconName, number: "02", title: "Write with CRAFT" },
  { color: "violet", description: "Build reusable assistants for recurring preparation, feedback and planning work.", icon: "sparkles" as IconName, number: "03", title: "Build assistants" },
  { color: "teal", description: "Ground AI drafts in safe, teacher-owned sources and verify every classroom claim.", icon: "document" as IconName, number: "04", title: "Use your sources" },
];

const learningFeatures = [
  { description: "Readable, practical lessons that explain each idea with classroom examples.", icon: "book" as IconName, title: "Text-first lessons" },
  { description: "Real expert videos play inside each lesson when you want a deeper explanation.", icon: "play" as IconName, title: "Embedded videos" },
  { description: "Concept checks and practice labs turn knowledge into repeatable teaching habits.", icon: "target" as IconName, title: "Active practice" },
  { description: "Templates and reusable agents help you carry strong work into your next class.", icon: "sparkles" as IconName, title: "Reusable tools" },
];

export default function HomePage() {
  return (
    <div className="marketing-page">
      <header className="marketing-header">
        <Brand />
        <nav className="marketing-nav" aria-label="Main navigation">
          <a href="#pathway">Learning path</a>
          <a href="#experience">How it works</a>
          <a href="#outcomes">Outcomes</a>
        </nav>
        <Link className="button button-secondary button-small" href="/sign-in">Sign in</Link>
      </header>

      <main id="main-content">
        <section className="marketing-hero" aria-labelledby="home-title">
          <div className="hero-copy">
            <span className="eyebrow">Practical AI learning for educators</span>
            <h1 id="home-title">Learn AI. Practise safely. Teach with confidence.</h1>
            <p>A guided learning experience that helps school educators understand AI, write better prompts and build useful classroom workflows.</p>
            <div className="button-row hero-actions">
              <Link className="button button-primary" href="/sign-in">Start learning <Icon name="arrow-right" /></Link>
              <a className="button button-secondary" href="#pathway">Explore the four modules</a>
            </div>
          </div>

          <div className="stitch-product-preview" aria-label="Preview of the PromptShala learning experience">
            <div className="stitch-progress-rail">
              <span className="stitch-progress-score">50%</span>
              <div>
                <strong>Learning pathway</strong>
                <small>Module 2 · Writing better prompts</small>
              </div>
              <div className="stitch-progress-track"><span /></div>
              <small>2 of 4 modules</small>
            </div>

            <div className="stitch-product-grid">
              <article className="stitch-lesson-card">
                <header><span>Lesson 1 · Text lesson</span><small>6 min read</small></header>
                <div className="stitch-lesson-content">
                  <span className="eyebrow">AI Foundations</span>
                  <h2>Meet generative AI</h2>
                  <p>Generative AI creates a new draft from your instruction. It can be useful, fluent and still incomplete or incorrect.</p>
                  <div className="stitch-lesson-callout">
                    <Icon name="shield" />
                    <p><strong>Teacher review stays essential.</strong> Treat every result as a starting point for professional judgment.</p>
                  </div>
                </div>
                <footer><span><Icon name="check" /> Key idea understood</span><span>Continue reading <Icon name="arrow-right" /></span></footer>
              </article>

              <div className="stitch-preview-stack">
                <article className="stitch-video-card">
                  <header><span><i /> Expert demonstration</span><small>04:18</small></header>
                  <h3>Turn a classroom need into a clear prompt</h3>
                  <div className="stitch-video-player">
                    <span className="stitch-preview-play"><Icon name="play" /></span>
                    <div><small>01:24</small><span><i /></span></div>
                    <b>CC</b>
                  </div>
                </article>

                <article className="stitch-craft-card">
                  <header><span><i /> CRAFT Prompt Sandbox</span><small>Practice safely</small></header>
                  <dl>
                    <div><dt>Context</dt><dd>Class 7 science</dd></div>
                    <div><dt>Role</dt><dd>Question designer</dd></div>
                    <div><dt>Action</dt><dd>Create a question bank</dd></div>
                    <div><dt>Format</dt><dd>Table with answers</dd></div>
                    <div><dt>Target</dt><dd>Photosynthesis</dd></div>
                  </dl>
                  <div className="stitch-craft-score"><span><Icon name="check" /> Clear task</span><span><Icon name="check" /> Review step</span></div>
                </article>
              </div>
            </div>
          </div>

          <div className="hero-belief">
            <p>PromptShala makes AI learning clear, practical and safe for busy educators.</p>
            <div className="trust-row" aria-label="Product principles">
              <span><Icon name="shield" /> Privacy-first</span>
              <span><Icon name="target" /> Classroom-focused</span>
              <span><Icon name="progress" /> Progress you can see</span>
            </div>
          </div>
        </section>

        <section className="landing-feature-strip" aria-label="Learning experience highlights">
          <article className="landing-feature feature-violet"><Icon name="book" /><h2>Read</h2><p>Clear text lessons for every concept</p></article>
          <article className="landing-feature feature-amber"><Icon name="play" /><h2>Watch</h2><p>Expert videos embedded in context</p></article>
          <article className="landing-feature feature-coral"><Icon name="sparkles" /><h2>Practise</h2><p>Tools, checks and guided challenges</p></article>
        </section>

        <section className="pathway-section" id="pathway" aria-labelledby="pathway-title">
          <div className="landing-section-heading">
            <span className="eyebrow">A complete classroom pathway</span>
            <h2 id="pathway-title">Four modules. One confident AI practice.</h2>
            <p>Move from first principles to reusable, source-grounded teaching workflows.</p>
          </div>
          <div className="pathway-grid">
            {pathway.map((item) => (
              <article className={`pathway-card pathway-${item.color}`} key={item.number}>
                <div><span>{item.number}</span><Icon name={item.icon} /></div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="experience-section" id="experience" aria-labelledby="experience-title">
          <div className="experience-copy">
            <span className="eyebrow">Built around the way teachers learn</span>
            <h2 id="experience-title">Read the idea, see it in action, then try it yourself.</h2>
            <p>Each lesson brings the explanation, evidence and practice together. You can read at your own pace, watch without leaving the site and save useful patterns for later.</p>
            <Link className="button button-primary" href="/sign-in">View the learning space <Icon name="arrow-right" /></Link>
          </div>
          <div className="experience-grid">
            {learningFeatures.map((feature) => (
              <article key={feature.title}><span><Icon name={feature.icon} /></span><h3>{feature.title}</h3><p>{feature.description}</p></article>
            ))}
          </div>
        </section>

        <section className="outcomes-section" id="outcomes" aria-labelledby="outcomes-title">
          <div>
            <span className="eyebrow">Designed for real school work</span>
            <h2 id="outcomes-title">Leave with work you can reuse tomorrow.</h2>
            <p>Build a prompt library, a set of AI assistants and a verification routine that fits your classroom.</p>
          </div>
          <ul>
            <li><Icon name="check" /><span><strong>Plan and assess faster</strong> with prompts you have tested.</span></li>
            <li><Icon name="check" /><span><strong>Protect learner privacy</strong> with clear boundaries and review habits.</span></li>
            <li><Icon name="check" /><span><strong>Reuse strong workflows</strong> across topics, classes and terms.</span></li>
          </ul>
        </section>

        <section className="landing-cta" aria-labelledby="landing-cta-title">
          <div><span className="eyebrow">Your next 25 minutes</span><h2 id="landing-cta-title">Start with AI Foundations.</h2><p>Open the demo and explore every module without waiting for prerequisites.</p></div>
          <Link className="button button-primary" href="/sign-in">Enter PromptShala <Icon name="arrow-right" /></Link>
        </section>
      </main>

      <footer className="marketing-footer"><Brand /><span>Practice-first AI literacy for educators</span><span>ET-617 · Group 6</span></footer>
    </div>
  );
}
