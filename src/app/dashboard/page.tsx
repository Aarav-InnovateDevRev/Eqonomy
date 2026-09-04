"use client";

import Link from "next/link";
import BottomNav from "@/components/layout/BottomNav";
import styles from "./dashboard.module.scss";

export default function DashboardPage() {
  // Temporary static data (we will connect to Firestore later)
  const stats = [
    { label: "Open Opportunities", value: "12", trend: "+3 this week" },
    { label: "Your Applications", value: "4", trend: "2 pending" },
    { label: "Completed", value: "7", trend: "+1 this month" },
    { label: "Reputation", value: "86", trend: "Good standing" },
  ];

  const opportunities = [
    {
      id: "1",
      type: "Paid Project",
      title: "Digitize paper inventory for local store",
      provider: "Sharma General Store",
      location: "South Delhi",
      compensation: "₹2,500",
      skills: ["Data Entry", "Excel"],
    },
    {
      id: "2",
      type: "Challenge",
      title: "Test our new food delivery app",
      provider: "QuickBite Startup",
      location: "Remote",
      compensation: "Certificate + Swag",
      skills: ["Mobile Testing", "Feedback"],
    },
    {
      id: "3",
      type: "Guidance",
      title: "30-min startup idea review",
      provider: "Aarav · Founder",
      location: "Online",
      compensation: "Free",
      skills: ["Business", "Validation"],
    },
  ];

  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <div className={styles.logoArea}>
              <span className={styles.logoMark}>✦</span>
              <span className={styles.logoText}>EQONOMY</span>
            </div>

            <div className={styles.searchWrap}>
              <input
                type="text"
                placeholder="Search opportunities..."
                className={styles.searchInput}
              />
            </div>

            <div className={styles.headerRight}>
              <Link href="/dashboard/profile" className={styles.avatar}>
                A
              </Link>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Stats Row */}
          <section className={styles.statsSection}>
            <div className={styles.statsGrid}>
              {stats.map((stat) => (
                <div key={stat.label} className={styles.statCard}>
                  <p className={styles.statLabel}>{stat.label}</p>
                  <p className={styles.statValue}>{stat.value}</p>
                  <p className={styles.statTrend}>{stat.trend}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Filters */}
          <section className={styles.filtersSection}>
            <div className={styles.filters}>
              <button className={`${styles.filterChip} ${styles.active}`}>
                All
              </button>
              <button className={styles.filterChip}>Paid Projects</button>
              <button className={styles.filterChip}>Challenges</button>
              <button className={styles.filterChip}>Guidance</button>
              <button className={styles.filterChip}>Internships</button>
            </div>
          </section>

          {/* Opportunity Feed */}
          <section className={styles.feedSection}>
            <div className={styles.sectionHeader}>
              <h2>Opportunities in Delhi-NCR</h2>
              <Link href="/dashboard/create" className={styles.postBtn}>
                + Post Opportunity
              </Link>
            </div>

            <div className={styles.feed}>
              {opportunities.map((opp) => (
                <article key={opp.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <span className={styles.typeBadge}>{opp.type}</span>
                    <span className={styles.location}>{opp.location}</span>
                  </div>

                  <h3 className={styles.cardTitle}>{opp.title}</h3>
                  <p className={styles.provider}>{opp.provider}</p>

                  <div className={styles.skills}>
                    {opp.skills.map((skill) => (
                      <span key={skill} className={styles.skillPill}>
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className={styles.cardFooter}>
                    <span className={styles.compensation}>{opp.compensation}</span>
                    <button className={styles.applyBtn}>View & Apply</button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}