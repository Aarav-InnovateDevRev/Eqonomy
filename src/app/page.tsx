import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.tagline}>Delhi-NCR · Opportunities · Real work</p>

        <h1 className={styles.title}>
          Find opportunities.
          <br />
          Build proof. Get paid.
        </h1>

        <p className={styles.subtitle}>
          Eqonomy is the marketplace where students and young people discover
          paid projects, internships, challenges and guidance sessions from
          real local providers — not just through contacts.
        </p>

        {/* KEEP SAME BUTTONS */}
        <div className={styles.ctaRow}>
          <Link href="/login" className={styles.ctaPrimary}>
            Get Started
          </Link>
          <Link href="/dashboard" className={styles.ctaSecondary}>
            Explore Opportunities
          </Link>
        </div>

        <div className={styles.pillars}>
          <div className={styles.pillar}>
            <h3>For Seekers</h3>
            <p>
              Apply to internships, paid tasks and guidance. Build a portfolio
              from real completed work.
            </p>
          </div>
          <div className={styles.pillar}>
            <h3>For Providers</h3>
            <p>
              Post work, review applicants, select talent and pay fairly —
              with structure, not chaos.
            </p>
          </div>
          <div className={styles.pillar}>
            <h3>Why Eqonomy</h3>
            <p>
              Delhi-first. Transparent flow. Reputation that grows when you
              finish and deliver.
            </p>
          </div>
        </div>

        <section className={styles.howSection}>
          <h2 className={styles.howTitle}>How it works</h2>
          <div className={styles.howGrid}>
            <div className={styles.howItem}>
              <span className={styles.step}>1</span>
              <h3>Create your account</h3>
              <p>Set your profile and unique Eqonomy ID in minutes.</p>
            </div>
            <div className={styles.howItem}>
              <span className={styles.step}>2</span>
              <h3>Browse & apply</h3>
              <p>Find local or remote opportunities that match your skills.</p>
            </div>
            <div className={styles.howItem}>
              <span className={styles.step}>3</span>
              <h3>Get selected & deliver</h3>
              <p>Talk to the host, complete the work, earn trust.</p>
            </div>
            <div className={styles.howItem}>
              <span className={styles.step}>4</span>
              <h3>Grow your portfolio</h3>
              <p>Completed work and reputation stay with you on Eqonomy.</p>
            </div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <h2>Ready to start?</h2>
          <p>
            Whether you want experience, income, or both — Eqonomy is built for
            people who want to do the work, not wait for a perfect resume.
          </p>
          <div className={styles.ctaRow}>
            <Link href="/login" className={styles.ctaPrimary}>
              Get Started
            </Link>
            <Link href="/dashboard" className={styles.ctaSecondary}>
              Explore Opportunities
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}