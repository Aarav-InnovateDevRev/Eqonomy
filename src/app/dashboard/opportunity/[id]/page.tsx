"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile, Opportunity } from "@/types";
import styles from "./opportunity.module.scss";

export default function OpportunityDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [message, setMessage] = useState("");
  const [coverMessage, setCoverMessage] = useState("");

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

  // Load opportunity + check if already applied
  useEffect(() => {
    if (!id || !user) return;

    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "opportunities", id));
        if (!snap.exists()) {
          setLoading(false);
          return;
        }

        const data = snap.data();
        setOpportunity({
          id: snap.id,
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

        // Check if current user already applied
        const q = query(
          collection(db, "applications"),
          where("opportunityId", "==", id),
          where("seekerId", "==", user.uid)
        );
        const appSnap = await getDocs(q);
        setHasApplied(!appSnap.empty);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [id, user]);

  const handleApply = async () => {
    if (!user || !profile || !opportunity) return;

    setApplying(true);
    setMessage("");

    try {
      await addDoc(collection(db, "applications"), {
        opportunityId: opportunity.id,
        seekerId: user.uid,
        seekerName: profile.displayName || "Anonymous",
        status: "pending",
        coverMessage: coverMessage.trim() || "",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setHasApplied(true);
      setMessage("Application submitted successfully!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to apply. Please try again.");
    } finally {
      setApplying(false);
    }
  };

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
        <p>Loading opportunity…</p>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className={styles.loadingScreen}>
        <p>Opportunity not found.</p>
        <Link href="/dashboard" className={styles.backLink}>
          ← Back to feed
        </Link>
      </div>
    );
  }

  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/dashboard" className={styles.back}>
              ← Back
            </Link>
            <h1>Opportunity</h1>
            <div style={{ width: 50 }} />
          </div>
        </header>

        <div className={styles.content}>
          <article className={styles.card}>
            <div className={styles.topRow}>
              <span className={styles.typeBadge}>
                {formatType(opportunity.type)}
              </span>
              <span className={styles.location}>
                {opportunity.isRemote ? "Remote" : opportunity.location}
              </span>
            </div>

            <h2 className={styles.title}>{opportunity.title}</h2>
            <p className={styles.provider}>Posted by {opportunity.providerName}</p>

            <div className={styles.meta}>
              <div>
                <span className={styles.metaLabel}>Compensation</span>
                <span className={styles.metaValue}>
                  {opportunity.compensation || "Not specified"}
                </span>
              </div>
              <div>
                <span className={styles.metaLabel}>Duration</span>
                <span className={styles.metaValue}>
                  {opportunity.duration || "Flexible"}
                </span>
              </div>
            </div>

            <h3 className={styles.sectionTitle}>Description</h3>
            <p className={styles.description}>{opportunity.description}</p>

            {opportunity.skillsRequired?.length > 0 && (
              <>
                <h3 className={styles.sectionTitle}>Skills Required</h3>
                <div className={styles.skills}>
                  {opportunity.skillsRequired.map((skill) => (
                    <span key={skill} className={styles.skillPill}>
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </article>

          {/* Apply Section */}
          <section className={styles.card}>
            {hasApplied ? (
              <div className={styles.appliedState}>
                <div className={styles.appliedIcon}>✓</div>
                <h3>You have already applied</h3>
                <p>The provider will review your application.</p>
              </div>
            ) : (
              <>
                <h3 className={styles.sectionTitle}>Apply for this opportunity</h3>
                <label className={styles.label}>
                  Short message (optional)
                </label>
                <textarea
                  value={coverMessage}
                  onChange={(e) => setCoverMessage(e.target.value)}
                  className={styles.textarea}
                  placeholder="Tell the provider why you're a good fit..."
                  rows={4}
                />

                {message && (
                  <p
                    className={
                      message.includes("success")
                        ? styles.successMsg
                        : styles.errorMsg
                    }
                  >
                    {message}
                  </p>
                )}

                <button
                  onClick={handleApply}
                  className={styles.applyBtn}
                  disabled={applying}
                >
                  {applying ? "Submitting…" : "Submit Application"}
                </button>
              </>
            )}
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}