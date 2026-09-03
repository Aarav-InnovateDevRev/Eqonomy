import BottomNav from "@/components/layout/BottomNav";
import styles from "./dashboard.module.scss";

export default function DashboardPage() {
  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        <header className={styles.header}>
          <div className="container">
            <h1 className={styles.logo}>EQONOMY</h1>
            <p className={styles.welcome}>Opportunity Feed · Delhi-NCR</p>
          </div>
        </header>

        <section className={styles.feedSection}>
          <div className="container">
            <div className={styles.filters}>
              <button className={`${styles.filterChip} ${styles.active}`}>
                All
              </button>
              <button className={styles.filterChip}>Paid Projects</button>
              <button className={styles.filterChip}>Challenges</button>
              <button className={styles.filterChip}>Guidance</button>
            </div>

            <div className={styles.emptyState}>
              <h2>No opportunities yet</h2>
              <p>
                We are onboarding hosts first. Real opportunities from local
                businesses, startups and professionals will appear here soon.
              </p>
              <p className={styles.hint}>
                Founder tip: Start by creating the first opportunity yourself.
              </p>
            </div>
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}