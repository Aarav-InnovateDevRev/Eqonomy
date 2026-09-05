"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile, Opportunity } from "@/types";
import styles from "./dashboard.module.scss";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  // Auth + Profile
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
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Real-time opportunities from Firestore
  useEffect(() => {
    const q = query(
      collection(db, "opportunities"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: Opportunity[] = [];

        snapshot.forEach((doc) => {
          const data = doc.data();
          list.push({
            id: doc.id,
            providerId: data.providerId,
            providerName: data.providerName,
            type: data.type,
            title: data.title,
            description: data.description,
            skillsRequired: data.skillsRequired || [],
            location: data.location,
            isRemote: data.isRemote || false,
            compensation: data.compensation,
            duration: data.duration,
            status: data.status,
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toMillis()
                : Date.now(),
            updatedAt:
              data.updatedAt instanceof Timestamp
                ? data.updatedAt.toMillis()
                : Date.now(),
            applicationCount: data.applicationCount || 0,
          });
        });

        setOpportunities(list);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching opportunities:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filteredOpportunities =
    activeFilter === "all"
      ? opportunities
      : opportunities.filter((opp) => {
          if (activeFilter === "paid") return opp.type === "paid_project";
          if (activeFilter === "challenge") return opp.type === "challenge";
          if (activeFilter === "guidance")
            return opp.type === "guidance" || opp.type === "portfolio_review";
          if (activeFilter === "internship") return opp.type === "internship";
          return true;
        });

  const stats = [
    {
      label: "Open Opportunities",
      value: String(opportunities.length),
      trend: opportunities.length > 0 ? "Live now" : "None yet",
    },
    {
      label: "Your Applications",
      value: "0",
      trend: "Coming soon",
    },
    {
      label: "Completed",
      value: "0",
      trend: "Start your first",
    },
    {
      label: "Reputation",
      value: String(profile?.reputationScore || 50),
      trend: "New member",
    },
  ];

  const formatType = (type: string) => {
    const map: Record<string, string> = {
      paid_project: "Paid Project",
      internship: "Internship",
      challenge: "Challenge",
      guidance: "Guidance",
      portfolio_review: "Portfolio Review",
      research: "Research",
      collaboration: "Collaboration",
      volunteering: "Volunteering",
      recruitment: "Recruitment",
    };
    return map[type] || type;
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading Eqonomy…</p>
      </div>
    );
  }

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
            <h1>
              Welcome{profile?.displayName ? `, ${profile.displayName}` : ""}
            </h1>
            <p>
              Role:{" "}
              {profile?.role === "provider"
                ? "Opportunity Provider"
                : "Opportunity Seeker"}
            </p>
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
              <button
                className={`${styles.filterChip} ${
                  activeFilter === "all" ? styles.active : ""
                }`}
                onClick={() => setActiveFilter("all")}
              >
                All
              </button>
              <button
                className={`${styles.filterChip} ${
                  activeFilter === "paid" ? styles.active : ""
                }`}
                onClick={() => setActiveFilter("paid")}
              >
                Paid Projects
              </button>
              <button
                className={`${styles.filterChip} ${
                  activeFilter === "challenge" ? styles.active : ""
                }`}
                onClick={() => setActiveFilter("challenge")}
              >
                Challenges
              </button>
              <button
                className={`${styles.filterChip} ${
                  activeFilter === "guidance" ? styles.active : ""
                }`}
                onClick={() => setActiveFilter("guidance")}
              >
                Guidance
              </button>
              <button
                className={`${styles.filterChip} ${
                  activeFilter === "internship" ? styles.active : ""
                }`}
                onClick={() => setActiveFilter("internship")}
              >
                Internships
              </button>
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

            {filteredOpportunities.length === 0 ? (
              <div className={styles.emptyState}>
                <h3>No opportunities yet</h3>
                <p>
                  Be the first to post one. Real opportunities from local
                  businesses and professionals will appear here.
                </p>
                <Link href="/dashboard/create" className={styles.postBtn}>
                  + Post the first opportunity
                </Link>
              </div>
            ) : (
              <div className={styles.feed}>
                {filteredOpportunities.map((opp) => (
                  <article key={opp.id} className={styles.card}>
                    <div className={styles.cardTop}>
                      <span className={styles.typeBadge}>
                        {formatType(opp.type)}
                      </span>
                      <span className={styles.location}>
                        {opp.isRemote ? "Remote" : opp.location}
                      </span>
                    </div>

                    <h3 className={styles.cardTitle}>{opp.title}</h3>
                    <p className={styles.provider}>{opp.providerName}</p>

                    <div className={styles.skills}>
                      {opp.skillsRequired?.slice(0, 4).map((skill) => (
                        <span key={skill} className={styles.skillPill}>
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className={styles.cardFooter}>
                      <span className={styles.compensation}>
                        {opp.compensation || "Not specified"}
                      </span>
                      <Link
                          href={`/dashboard/opportunity/${opp.id}`}
                          className={styles.applyBtn}
                            >
                           View & Apply
                     </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}