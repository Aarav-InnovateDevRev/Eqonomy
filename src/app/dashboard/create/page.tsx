"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile, OpportunityType } from "@/types";
import styles from "./create.module.scss";

const OPPORTUNITY_TYPES: { value: OpportunityType; label: string }[] = [
  { value: "paid_project", label: "Paid Project" },
  { value: "internship", label: "Internship" },
  { value: "challenge", label: "Challenge" },
  { value: "guidance", label: "Guidance / Review" },
  { value: "portfolio_review", label: "Portfolio Review" },
  { value: "research", label: "Research Project" },
  { value: "collaboration", label: "Collaboration" },
  { value: "volunteering", label: "Volunteering" },
  { value: "recruitment", label: "Recruitment" },
];

export default function CreateOpportunityPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Form fields
  const [type, setType] = useState<OpportunityType>("paid_project");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [skills, setSkills] = useState("");
  const [location, setLocation] = useState("Delhi-NCR");
  const [isRemote, setIsRemote] = useState(false);
  const [compensation, setCompensation] = useState("");
  const [duration, setDuration] = useState("");

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
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;

    setError("");
    setSubmitting(true);

    try {
      const skillsArray = skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      await addDoc(collection(db, "opportunities"), {
        providerId: user.uid,
        providerName: profile.displayName || "Anonymous",
        type,
        title: title.trim(),
        description: description.trim(),
        skillsRequired: skillsArray,
        location: location.trim(),
        isRemote,
        compensation: compensation.trim() || "Not specified",
        duration: duration.trim() || "Flexible",
        status: "open",
        applicationCount: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSuccess(true);

      // Reset form after short delay
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to post opportunity. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading…</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className={styles.successScreen}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2>Opportunity Posted!</h2>
          <p>It is now live on the feed.</p>
        </div>
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
            <h1>Post Opportunity</h1>
            <div style={{ width: 50 }} />
          </div>
        </header>

        <div className={styles.content}>
          <form onSubmit={handleSubmit} className={styles.form}>
            {/* Type */}
            <label className={styles.label}>Opportunity Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as OpportunityType)}
              className={styles.select}
              required
            >
              {OPPORTUNITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>

            {/* Title */}
            <label className={styles.label}>Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.input}
              placeholder="e.g. Digitize paper inventory for local store"
              required
              maxLength={100}
            />

            {/* Description */}
            <label className={styles.label}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={styles.textarea}
              placeholder="Explain the task clearly. What needs to be done? What is the expected outcome?"
              rows={5}
              required
            />

            {/* Skills */}
            <label className={styles.label}>
              Skills Required <span>(comma separated)</span>
            </label>
            <input
              type="text"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className={styles.input}
              placeholder="e.g. Excel, Data Entry, Communication"
            />

            {/* Location */}
            <label className={styles.label}>Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={styles.input}
              placeholder="e.g. South Delhi, Noida, Gurgaon"
            />

            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
              />
              This can be done remotely
            </label>

            {/* Compensation & Duration */}
            <div className={styles.row}>
              <div>
                <label className={styles.label}>Compensation</label>
                <input
                  type="text"
                  value={compensation}
                  onChange={(e) => setCompensation(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. ₹2500 or Free"
                />
              </div>
              <div>
                <label className={styles.label}>Duration</label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className={styles.input}
                  placeholder="e.g. 1 week, 10 hours"
                />
              </div>
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={submitting || !title || !description}
            >
              {submitting ? "Posting…" : "Post Opportunity"}
            </button>
          </form>
        </div>
      </main>

      <BottomNav />
    </>
  );
}