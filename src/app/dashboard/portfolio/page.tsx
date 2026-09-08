"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import styles from "./portfolio.module.scss";

interface PortfolioItem {
  id: string;
  title: string;
  type: string;
  status: string;
  role: "provider" | "seeker";
  otherPerson: string;
}

export default function PortfolioPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<PortfolioItem[]>([]);
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
        console.error(err);
      }
    });
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        const list: PortfolioItem[] = [];

        // Selected applications (as seeker)
        const seekerQ = query(
          collection(db, "applications"),
          where("seekerId", "==", user.uid)
        );
        const seekerSnap = await getDocs(seekerQ);
        seekerSnap.forEach((d) => {
          const data = d.data();
          if (data.status === "selected" || data.status === "completed") {
            list.push({
              id: d.id,
              title: data.opportunityTitle || "Selected Opportunity",
              type: "application",
              status: data.status,
              role: "seeker",
              otherPerson: "Provider",
            });
          }
        });

        // Opportunities posted by user
        const providerQ = query(
          collection(db, "opportunities"),
          where("providerId", "==", user.uid)
        );
        const providerSnap = await getDocs(providerQ);
        providerSnap.forEach((d) => {
          const data = d.data();
          list.push({
            id: d.id,
            title: data.title,
            type: data.type || "opportunity",
            status: data.status || "open",
            role: "provider",
            otherPerson: "Your posting",
          });
        });

        setItems(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const selectedCount = items.filter((i) => i.status === "selected" || i.status === "completed").length;
  const postedCount = items.filter((i) => i.role === "provider").length;

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading portfolio…</p>
      </div>
    );
  }

  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/dashboard" className={styles.backBtn}>
              ← Back
            </Link>
            <h1>Portfolio</h1>
            <div style={{ width: 60 }} />
          </div>
        </header>

        <div className={styles.content}>
          {/* Profile Card */}
          <section className={styles.profileCard}>
            <div className={styles.avatar}>
              {(profile?.name || profile?.displayName || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <h2>{profile?.name || profile?.displayName || "User"}</h2>
              <p className={styles.email}>{profile?.email}</p>
              <div className={styles.badges}>
                {profile?.isEmailVerified && (
                  <span className={styles.badge}>Email Verified</span>
                )}
                {(profile?.verificationStatus as string) === "email_verified" && (
                  <span className={styles.badge}>Verified</span>
                )}
              </div>
            </div>
          </section>

          {/* Stats */}
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{postedCount}</span>
              <span className={styles.statLabel}>Posted</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{selectedCount}</span>
              <span className={styles.statLabel}>Selected</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statNumber}>{items.length}</span>
              <span className={styles.statLabel}>Total</span>
            </div>
          </div>

          {/* Work List */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Work & Sessions</h3>

            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No work or sessions yet.</p>
                <p className={styles.hint}>
                  When you get selected or post opportunities, they will appear here.
                </p>
              </div>
            ) : (
              <div className={styles.list}>
                {items.map((item) => (
                  <div key={item.id} className={styles.itemCard}>
                    <div className={styles.itemTop}>
                      <span className={styles.roleBadge}>
                        {item.role === "seeker" ? "You worked on" : "You posted"}
                      </span>
                      <span
                        className={`${styles.statusBadge} ${
                          item.status === "selected" || item.status === "completed"
                            ? styles.success
                            : ""
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <h4 className={styles.itemTitle}>{item.title}</h4>
                    <p className={styles.itemMeta}>{item.otherPerson}</p>
                  </div>
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