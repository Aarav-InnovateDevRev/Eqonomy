"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  doc,
  updateDoc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
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
  const [savingId, setSavingId] = useState(false);
  const [message, setMessage] = useState("");
  const [idMessage, setIdMessage] = useState("");

  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>("seeker");
  const [bio, setBio] = useState("");
  const [delhiDistrict, setDelhiDistrict] = useState("");
  const [eqonomyIdInput, setEqonomyIdInput] = useState("");

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
        setDisplayName(userProfile.displayName || userProfile.name || "");
        setRole(userProfile.role || "seeker");
        setBio(userProfile.bio || "");
        setDelhiDistrict(userProfile.delhiDistrict || "");
        setEqonomyIdInput(userProfile.eqonomyId || "");
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const normalizeId = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_")
      .replace(/[^a-z0-9_]/g, "");

  const handleSaveId = async () => {
    if (!user || !profile) return;

    const nextId = normalizeId(eqonomyIdInput);

    if (nextId.length < 3 || nextId.length > 20) {
      setIdMessage("ID must be 3–20 characters (letters, numbers, _)");
      return;
    }

    // Already has this ID
    if (profile.eqonomyId === nextId) {
      setIdMessage("This is already your ID");
      return;
    }

    setSavingId(true);
    setIdMessage("");

    try {
      const usernameRef = doc(db, "usernames", nextId);
      const existing = await getDoc(usernameRef);

      if (existing.exists() && existing.data().uid !== user.uid) {
        setIdMessage("This ID is already taken. Try another.");
        setSavingId(false);
        return;
      }

      // Free old ID if changing
      if (profile.eqonomyId) {
        await deleteDoc(doc(db, "usernames", profile.eqonomyId)).catch(() => {});
      }

      // Reserve new ID
      await setDoc(usernameRef, {
        uid: user.uid,
        createdAt: serverTimestamp(),
      });

      // Save on user
      await updateDoc(doc(db, "users", user.uid), {
        eqonomyId: nextId,
        updatedAt: Date.now(),
      });

      setProfile((prev) => (prev ? { ...prev, eqonomyId: nextId } : prev));
      setEqonomyIdInput(nextId);
      setIdMessage("Eqonomy ID saved!");
    } catch (err) {
      console.error(err);
      setIdMessage("Failed to save ID. Try again.");
    } finally {
      setSavingId(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setMessage("");

    try {
      await updateDoc(doc(db, "users", user.uid), {
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
          <section className={styles.card}>
            <div className={styles.avatarLarge}>
              {displayName?.charAt(0).toUpperCase() || "U"}
            </div>
            <h2 className={styles.name}>{displayName || "User"}</h2>
            {profile?.eqonomyId && (
              <p className={styles.email}>@{profile.eqonomyId}</p>
            )}
            <p className={styles.email}>{user?.email}</p>
            <p className={styles.roleBadge}>
              {role === "provider"
                ? "Opportunity Provider"
                : "Opportunity Seeker"}
            </p>
          </section>

          {/* Unique Eqonomy ID */}
          <section className={styles.card}>
            <h3 className={styles.sectionTitle}>Eqonomy ID (unique)</h3>
            <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.75rem" }}>
              This is your public unique ID. Others will add you as a client using this.
            </p>

            <label className={styles.label}>Your ID</label>
            <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
              <span style={{ color: "#64748b", fontWeight: 600 }}>@</span>
              <input
                type="text"
                value={eqonomyIdInput}
                onChange={(e) => setEqonomyIdInput(e.target.value)}
                className={styles.input}
                placeholder="e.g. aarav_singh"
                style={{ marginBottom: 0 }}
              />
            </div>

            {idMessage && (
              <p
                className={
                  idMessage.includes("saved") || idMessage.includes("already your")
                    ? styles.successMsg
                    : styles.errorMsg
                }
                style={{ marginTop: "0.6rem" }}
              >
                {idMessage}
              </p>
            )}

            <button
              type="button"
              className={styles.saveBtn}
              onClick={handleSaveId}
              disabled={savingId}
              style={{ marginTop: "0.9rem" }}
            >
              {savingId ? "Saving…" : profile?.eqonomyId ? "Update ID" : "Set ID"}
            </button>
          </section>

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
                className={`${styles.roleBtn} ${
                  role === "seeker" ? styles.active : ""
                }`}
                onClick={() => setRole("seeker")}
              >
                Seeker
              </button>
              <button
                type="button"
                className={`${styles.roleBtn} ${
                  role === "provider" ? styles.active : ""
                }`}
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

            <button type="submit" className={styles.saveBtn} disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>

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