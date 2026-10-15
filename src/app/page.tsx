import Link from "next/link";
import styles from "./page.module.scss";

export default function HomePage() {
  return (
    <main className={styles.page}>
      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Delhi-NCR · Real opportunities</p>

          <h1 className={styles.title}>
            Find work.
            <span>Build proof.</span>
            Get selected.
          </h1>

          <p className={styles.subtitle}>
            Eqonomy is the opportunity marketplace for students and young
            people — paid projects, internships, challenges and guidance from
            real local providers.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/register" className={styles.btnPrimary}>
              Get Started
            </Link>
            <Link href="/login" className={styles.btnGhost}>
              Log in
            </Link>
          </div>

          <p className={styles.microNote}>
            Free to join · Unique Eqonomy ID · Built for beginners and doers
          </p>
        </div>
      </section>

      {/* Persona split */}
      <section className={styles.section}>
        <div className={styles.container}>
          <p className={styles.sectionLabel}>Choose your path</p>
          <h2 className={styles.sectionTitle}>Who are you on Eqonomy?</h2>

          <div className={styles.personaGrid}>
            <div className={styles.personaCard}>
              <p className={styles.personaTag}>For Seekers</p>
              <h3>I want opportunities</h3>
              <p>
                Browse paid projects, internships, challenges and guidance.
                Apply with your profile and build a real portfolio.
              </p>
              <ul>
                <li>Apply to live opportunities</li>
                <li>Track applications and alerts</li>
                <li>Grow reputation with completed work</li>
              </ul>
            </div>

            <div className={styles.personaCard}>
              <p className={styles.personaTag}>For Providers</p>
              <h3>I post opportunities</h3>
              <p>
                Share work, review applicants, select talent and complete
                payment through a clear structured flow.
              </p>
              <ul>
                <li>Post projects and guidance sessions</li>
                <li>Review applications with contact details</li>
                <li>Mark complete and pay with transparency</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className={`${styles.section} ${styles.sectionAlt}`}>
        <div className={styles.container}>
          <p className={styles.sectionLabel}>How it works</p>
          <h2 className={styles.sectionTitle}>From signup to first opportunity</h2>

          <div className={styles.steps}>
            <div className={styles.step}>
              <span>01</span>
              <h3>Create account</h3>
              <p>Set your profile and permanent Eqonomy ID.</p>
            </div>
            <div className={styles.step}>
              <span>02</span>
              <h3>Browse or post</h3>
              <p>Find work near you, or publish an opportunity.</p>
            </div>
            <div className={styles.step}>
              <span>03</span>
              <h3>Apply / select</h3>
              <p>Connect, complete the work, build trust.</p>
            </div>
            <div className={styles.step}>
              <span>04</span>
              <h3>Portfolio grows</h3>
              <p>Completed work and reputation stay with you.</p>
            </div>
          </div>
        </div>
      </section>

      {/* AI + trust */}
      <section className={styles.section}>
        <div className={styles.containerNarrow}>
          <p className={styles.sectionLabel}>Built-in guidance</p>
          <h2 className={styles.sectionTitle}>Eqonomy AI helps you decide faster</h2>
          <p className={styles.bodyText}>
            Once you’re inside, ask Eqonomy AI what fits your skills — paid
            projects, guidance, internships or challenges — based on live
            opportunities, not generic advice.
          </p>

          <div className={styles.ctaRow}>
            <Link href="/register" className={styles.btnPrimary}>
              Create free account
            </Link>
            <Link href="/terms" className={styles.btnGhost}>
              Read Terms
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerBrand}>
            <p className={styles.footerLogo}>EQONOMY</p>
            <p className={styles.footerTag}>
              Opportunity marketplace for Delhi-NCR — real work, real proof.
            </p>
          </div>

          <div className={styles.footerCols}>
            <div>
              <p className={styles.footerHead}>Product</p>
              <Link href="/register">Get Started</Link>
              <Link href="/login">Log in</Link>
              <Link href="/terms">Terms</Link>
            </div>

            <div>
              <p className={styles.footerHead}>Eqonomy HQ</p>
              <p>Aarav</p>
              <p>Class 9 founder</p>
              <a
                href="https://www.youtube.com/@Aarav-InnovateDevRev"
                target="_blank"
                rel="noopener noreferrer"
              >
                YouTube · Aarav-InnovateDevRev
              </a>
              <p>Discord · dontmind_rip</p>
            </div>

            <div>
              <p className={styles.footerHead}>Contact</p>
              <p>Report issues on Discord</p>
              <p>dontmind_rip</p>
              <p className={styles.muted}>Built in Delhi-NCR</p>
            </div>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} Eqonomy · Built by Aarav</p>
          <p className={styles.muted}>Proof of work over empty resumes</p>
        </div>
      </footer>
    </main>
  );
}