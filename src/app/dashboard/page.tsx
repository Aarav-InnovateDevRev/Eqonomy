"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { UserProfile } from "@/types";
import styles from "./dashboard.module.scss";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }

      setUser(firebaseUser);

      try {
        const userProfile = await ensureUserProfile(firebaseUser);
        setProfile(userProfile);
      } catch (err) {
        console.error("Error loading profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading Eqonomy…</p>
      </div>
    );
  }

  // Temporary static data (we will replace with real Firestore data later)
  const stats = [
    { label: "Open Opportunities", value: "12", trend: "+3 this week" },
    { label: "Your Applications", value: "0", trend: "None yet" },
    { label: "Completed", value: "0", trend: "Start your first" },
    { label: "Reputation", value: String(profile?.reputationScore || 50), trend: "New member" },
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
                {profile?.displayName?.charAt(0).toUpperCase() || "U"}
              </Link>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {/* Welcome */}
          <div className={styles.welcome}>
            <h1>Welcome{profile?.displayName ? `, ${profile.displayName}` : ""}</h1>
            <p>Role: {profile?.role === "provider" ? "Opportunity Provider" : "Opportunity Seeker"}</p>
          </div>

          {/* Stats */}
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
              <button className={`${styles.filterChip} ${styles.active}`}>All</button>
              <button className={styles.filterChip}>Paid Projects</button>
              <button className={styles.filterChip}>Challenges</button>
              <button className={styles.filterChip}>Guidance</button>
              <button className={styles.filterChip}>Internships</button>
            </div>
          </section>

          {/* Feed */}
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