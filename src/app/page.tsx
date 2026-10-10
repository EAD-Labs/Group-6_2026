import Image from "next/image";
import Link from "next/link";
import { TeachingPreview } from "@/components/teaching-preview";
import { Icon, type IconName } from "@/components/ui/icon";
import styles from "./page.module.css";

const topics: { title: string; description: string; example: string; icon: IconName }[] = [
  { title: "Understand AI", description: "Learn what AI can help with, where it makes mistakes, and how to check its work.", example: "Start with the basics", icon: "brain" },
  { title: "Write better AI requests", description: "Tell AI what you need in everyday words. Practise, get feedback, and save your requests.", example: "Try a lesson or quiz request", icon: "document" },
  { title: "Create a teaching helper", description: "Save a set of instructions for a task you do often, so you can use it again.", example: "Meet your AI Staffroom", icon: "sparkles" },
  { title: "Make resources from your material", description: "Turn your own lesson notes into a worksheet or quiz, then review it before using it.", example: "Bring your lesson notes", icon: "book" },
];

export default function HomePage() {
  return <div className={styles.page}>
    <header className={styles.header}><div className={styles.headerInner}>
      <Link className={styles.brand} href="/" aria-label="PromptShala home"><Image alt="" height={724} priority sizes="165px" src="/brand/promptshala-logo.png" width={2172} /></Link>
      <nav aria-label="Main navigation" className={styles.navigation}><a className={styles.guideLink} href="#what-you-learn">What you’ll learn</a><Link className={styles.guideLink} href="/help">Help</Link><Link className={styles.signIn} href="/sign-in">Sign in <Icon name="arrow-right" /></Link></nav>
    </div></header>
    <main id="main-content">
      <section className={styles.hero} aria-labelledby="home-title">
        <div className={styles.intro}>
          <p className={styles.eyebrow}><span />A little help for the work you love</p>
          <h1 id="home-title">AI for teaching.<br /><span>Made simple.</span></h1>
          <p className={styles.description}>Plan a lesson. Make a quiz. Explain a tricky topic.<br className={styles.desktopBreak} /> Learn to use AI for everyday teaching, one clear step at a time.</p>
          <div className={styles.actions}><Link className={styles.primary} href="/sign-up">Start learning <Icon name="arrow-right" /></Link><a className={styles.secondary} href="#how-it-works">See how it works <Icon name="play" /></a></div>
          <p className={styles.accessNote}><Icon name="check" />No AI experience needed. No coding. Learn at your pace.</p>
          <div className={styles.courseFacts}><span><strong>4</strong> practical modules</span><span><strong>29</strong> guided lessons</span><span><Icon name="shield" />You stay in control</span></div>
        </div>
        <TeachingPreview />
      </section>
      <section className={styles.stepsSection} id="how-it-works" aria-labelledby="steps-title">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>A comfortable place to begin</p><h2 id="steps-title">You don’t have to figure it out alone.</h2><p>We explain the idea, show an example, and help you try it.</p></div>
        <ol className={styles.steps}>
          <li><span>01</span><div><h3>Make it yours</h3><p>Tell us what you teach and whether you’ve tried tools like ChatGPT or Gemini.</p></div></li>
          <li><span>02</span><div><h3>Learn by trying</h3><p>Follow a classroom example, write your own request, and get useful feedback.</p></div></li>
          <li><span>03</span><div><h3>Keep what works</h3><p>Save your requests and teaching helpers. Come back to them for your next lesson.</p></div></li>
        </ol>
      </section>
      <section className={styles.learnSection} id="what-you-learn" aria-labelledby="learn-title">
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Useful skills. Familiar tasks.</p><h2 id="learn-title">A little more confidence,<br />with every lesson.</h2><p>Start with the basics or explore a task you need today. Every module is open.</p></div>
        <div className={styles.topicGrid}>{topics.map((topic,index) => <article className={styles.topic} key={topic.title}><div className={styles.topicTop}><span className={styles.topicIcon}><Icon name={topic.icon} /></span><span>Module {index+1}</span></div><h3>{topic.title}</h3><p>{topic.description}</p><span className={styles.topicExample}>{topic.example}<Icon name="arrow-right" /></span></article>)}</div>
      </section>
      <section className={styles.reassurance} aria-labelledby="questions-title">
        <div><p className={styles.eyebrow}>Good to know</p><h2 id="questions-title">New to AI?<br />You’re in the right place.</h2><p>Simple explanations, room to practise, and help when you need it.</p><Link className={styles.helpLink} href="/help">Read the getting started guide <Icon name="arrow-right" /></Link></div>
        <div className={styles.faq}>
          <details open><summary>What is a prompt?</summary><p>It’s simply the request you give AI. For example: “Make five questions about plants for my Class 5 students.” We’ll help you make that request clearer.</p></details>
          <details><summary>Do I need my own Gemini API key?</summary><p>No. You can read lessons and practise without one. If you already have a Gemini key, you can add it in Gemini connection to use your own access for live AI practice. Google’s usage limits and charges apply.</p></details>
          <details><summary>What is the AI Staffroom?</summary><p>A place to create and save teaching helpers: reusable instructions for tasks like planning lessons or making quizzes. You choose the instructions and check the results.</p></details>
          <details><summary>Will my work be saved?</summary><p>Your signed-in account keeps your progress, saved requests, and teaching helpers. Evaluated CRAFT requests are saved so you can return to them. Use fictional examples and keep student information out.</p></details>
        </div>
      </section>
      <section className={styles.closing} aria-labelledby="closing-title"><span className={styles.closingIcon}><Icon name="sparkles" /></span><h2 id="closing-title">Your next lesson starts here.</h2><p>Bring your teaching experience. We’ll help with the AI part.</p><Link className={styles.primary} href="/sign-up">Create my account <Icon name="arrow-right" /></Link></section>
    </main>
    <footer className={styles.footer}><span>Made for teachers, with care.</span><nav aria-label="Help and privacy"><Link href="/help">Help</Link><Link href="/privacy">Privacy &amp; safe use</Link></nav><span className={styles.credit}>ET-617 · Group 6</span></footer>
  </div>;
}
