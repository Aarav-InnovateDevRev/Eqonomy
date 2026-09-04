"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile, signOut } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile, UserRole } from "@/types";
import styles from "./profile.module.scss";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  // Form state
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("seeker");
  const [bio, setBio] = useState("");
  const [delhiDistrict, setDelhiDistrict] = useState("");

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
        setDisplayName(userProfile.displayName || "");
        setRole(userProfile.role || "seeker");
        setBio(userProfile.bio || "");
        setDelhiDistrict(userProfile.delhiDistrict || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        displayName: displayName.trim(),
        role,
        bio: bio.trim(),
        delhiDistrict: delhiDistrict.trim(),
        updatedAt: Date.now(),
      });

      setProfile((prev) =>
        prev
          ? {
              ...prev,
              displayName: displayName.trim(),
              role,
              bio: bio.trim(),
              delhiDistrict: delhiDistrict.trim(),
            }
          : prev
      );

      setMessage("Profile updated successfully");
    } catch (err) {
      console.error(err);
      setMessage("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading profile…</p>
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
            <h1>Profile</h1>
            <div style={{ width: 60 }} />
          </div>
        </header>

        <div className={styles.content}>
          {/* Avatar + basic info */}
          <section className={styles.card}>
            <div className={styles.avatarLarge}>
              {displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className={styles.name}>{displayName || "User"}</h2>
            <p className={styles.email}>{user?.email}</p>
            <p className={styles.roleBadge}>
              {role === "provider" ? "Opportunity Provider" : "Opportunity Seeker"}
            </p>
          </section>

          {/* Edit form */}
          <form onSubmit={handleSave} className={styles.card}>
            <h3 className={styles.sectionTitle}>Basic Info</h3>

            <label className={styles.label}>Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className={styles.input}
              placeholder="Your name"
              required
            />

            <label className={styles.label}>I am a...</label>
            <div className={styles.roleSwitcher}>
              <button
                type="button"
                className={`${styles.roleBtn} ${role === "seeker" ? styles.active : ""}`}
                onClick={() => setRole("seeker")}
              >
                Seeker
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${role === "provider" ? styles.active : ""}`}
                onClick={() => setRole("provider")}
              >
                Provider
              </button>
            </div>

            <label className={styles.label}>Delhi District (optional)</label>
            <input
              type="text"
              value={delhiDistrict}
              onChange={(e) => setDelhiDistrict(e.target.value)}
              className={styles.input}
              placeholder="e.g. South Delhi, Noida, Gurgaon"
            />

            <label className={styles.label}>Short Bio (optional)</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className={styles.textarea}
              placeholder="Tell others a bit about you..."
              rows={3}
            />

            {message && (
              <p className={message.includes("success") ? styles.successMsg : styles.errorMsg}>
                {message}
              </p>
            )}

            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>

          {/* Account actions */}
          <section className={styles.card}>
            <h3 className={styles.sectionTitle}>Account</h3>
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}