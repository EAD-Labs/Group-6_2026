import Image from "next/image";
import Link from "next/link";

import { Icon } from "@/components/ui/icon";
import styles from "./page.module.css";

export default function HomePage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} href="/" aria-label="PromptShala home">
            <Image alt="" height={724} priority sizes="165px" src="/brand/promptshala-logo.png" width={2172} />
          </Link>
          <nav aria-label="Main navigation" className={styles.navigation}>
            <Link className={styles.guideLink} href="/help">User guide</Link>
            <Link className={styles.signIn} href="/sign-in">Sign in <Icon name="arrow-right" /></Link>
          </nav>
        </div>
      </header>

      <main className={styles.main} id="main-content">
        <section className={styles.hero} aria-labelledby="home-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>AI literacy for teachers</p>
            <h1 id="home-title">Your next lesson,<br /><em>with a little AI.</em></h1>
            <p className={styles.description}>Practical skills. Thoughtful teaching.<br />A little practice to bring the two together.</p>
            <div className={styles.actions}>
              <Link className={styles.primary} href="/sign-up">Start learning <Icon name="arrow-right" /></Link>
              <Link className={styles.demo} href="/sign-in">I have an account</Link>
            </div>
            <p className={styles.accessNote}>Create your account. All modules are open.</p>
            <ul className={styles.courseFacts} aria-label="Course at a glance">
              <li>4 modules</li>
              <li>29 lessons</li>
              <li>At your pace</li>
            </ul>
          </div>

          <div className={styles.illustration} aria-hidden="true">
            <div className={styles.bookShadow} />
            <div className={styles.book}>
              <div className={styles.bookPages} />
              <div className={styles.bookCover}>
                <div className={styles.bookTopline}><span>PromptShala</span><span>01—04</span></div>
                <div className={styles.bookTitle}>The teacher’s<br /><em>practice book.</em></div>
                <div className={styles.bookMotif}>
                  <span className={styles.motifOne} /><span className={styles.motifTwo} />
                  <span className={styles.motifThree} /><span className={styles.motifFour} />
                </div>
                <div className={styles.bookBottomline}><span>Read. Try. Make it yours.</span><span>PS.</span></div>
              </div>
              <span className={styles.bookmark} />
            </div>
            <span className={styles.pencil} />
            <p className={styles.artCaption}>A new chapter in your teaching.</p>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>Made for educators, with care.</span>
        <nav aria-label="Help and privacy">
          <Link href="/help">Help</Link>
          <Link href="/privacy">Privacy &amp; safe use</Link>
        </nav>
        <span className={styles.credit}>ET-617 · Group 6</span>
      </footer>
    </div>
  );
}
