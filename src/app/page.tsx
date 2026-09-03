import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.hero}>
      <div className={styles.container}>
        <p className={styles.tagline}>Want to do It?</p>
        <h1 className={styles.title}>
          Opportunity should not depend on who you already know.
        </h1>
        <p className={styles.subtitle}>
          Eqonomy is the Airbnb-inspired marketplace for real opportunities from
          local businesses, startups, NGOs and professionals in Delhi-NCR.
        </p>

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
            <h3>Delhi-First</h3>
            <p>Hyper-local density before scaling.</p>
          </div>
          <div className={styles.pillar}>
            <h3>Hosts-First</h3>
            <p>We onboard opportunity providers first.</p>
          </div>
          <div className={styles.pillar}>
            <h3>Proof of Work</h3>
            <p>Completed real projects over empty resumes.</p>
          </div>
        </div>
      </div>
    </main>
  );
}