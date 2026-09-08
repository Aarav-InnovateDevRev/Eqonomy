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
  orderBy,
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
  createdAt: any;
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

        // 1. Applications where user was selected (as seeker)
        const seekerQ = query(
          collection(db, "applications"),
          where("seekerId", "==", user.uid),
          where("status", "in", ["selected", "completed"])
        );
        const seekerSnap = await getDocs(seekerQ);

        for (const d of seekerSnap.docs) {
          const data = d.data();
          // Get opportunity title
          let title = "Opportunity";
          try {
            const oppSnap = await getDocs(
              query(collection(db, "opportunities"), where("__name__", "==", data.opportunityId))
            );
            // simpler way:
          } catch {}
          
          list.push({
            id: d.id,
            title: data.opportunityTitle || "Selected Opportunity",
            type: "application",
            status: data.status,
            role: "seeker",
            otherPerson: data.providerName || "Provider",
            createdAt: data.createdAt,
          });
        }

        // 2. Opportunities the user posted that have selected applications
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
            createdAt: data.createdAt,
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
            <h1>My Portfolio</h1>
          </div>
        </header>

        <div className={styles.content}>
          {/* Profile Summary */}
          <section className={styles.summaryCard}>
            <h2>{profile?.name || profile?.displayName || "User"}</h2>
            <p className={styles.email}>{profile?.email}</p>
            <div className={styles.badges}>
              {profile?.isEmailVerified && (
                <span className={styles.badge}>Email Verified</span>
              )}
              {profile?.isPhoneVerified && (
                <span className={styles.badge}>Phone Verified</span>
              )}
            </div>
          </section>

          {/* Completed / Selected Work */}
          <section className={styles.section}>
            <h3 className={styles.sectionTitle}>Work & Sessions</h3>

            {items.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No completed work or sessions yet.</p>
                <p className={styles.hint}>
                  When you get selected for opportunities or complete guidance sessions, they will appear here.
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
                      <span className={styles.statusBadge}>{item.status}</span>
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