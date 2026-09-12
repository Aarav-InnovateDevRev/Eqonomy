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
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import styles from "./clients.module.scss";

interface ClientItem {
  clientUid: string;
  eqonomyId: string;
  displayName: string;
  addedAt?: number;
}

export default function ClientsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [inputId, setInputId] = useState("");
  const [message, setMessage] = useState("");
  const [working, setWorking] = useState(false);

  useEffect(() => {
    const unsub = subscribeToAuth(async (firebaseUser) => {
      if (!firebaseUser) {
        router.push("/login");
        return;
      }
      setUser(firebaseUser);
      await ensureUserProfile(firebaseUser);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!user) return;

    const q = collection(db, "users", user.uid, "clients");
    const unsub = onSnapshot(q, (snap) => {
      const list: ClientItem[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          clientUid: data.clientUid || d.id,
          eqonomyId: data.eqonomyId || "",
          displayName: data.displayName || "User",
          addedAt: data.addedAt?.toMillis?.() || Date.now(),
        });
      });
      setClients(list);
      setLoading(false);
    });

    return () => unsub();
  }, [user]);

  const normalizeId = (v: string) =>
    v.trim().toLowerCase().replace(/^@/, "").replace(/\s+/g, "_");

  const handleAdd = async () => {
    if (!user) return;
    const id = normalizeId(inputId);
    if (!id) {
      setMessage("Enter an Eqonomy ID");
      return;
    }

    setWorking(true);
    setMessage("");

    try {
      // Find user by eqonomyId via usernames lookup
      const usernameSnap = await getDoc(doc(db, "usernames", id));
      if (!usernameSnap.exists()) {
        setMessage("No user found with this ID");
        setWorking(false);
        return;
      }

      const clientUid = usernameSnap.data().uid as string;

      if (clientUid === user.uid) {
        setMessage("You cannot add yourself");
        setWorking(false);
        return;
      }

      // Already added?
      const existing = await getDoc(doc(db, "users", user.uid, "clients", clientUid));
      if (existing.exists()) {
        setMessage("Already in your client list");
        setWorking(false);
        return;
      }

      const clientProfile = await getDoc(doc(db, "users", clientUid));
      const data = clientProfile.data() || {};

      await setDoc(doc(db, "users", user.uid, "clients", clientUid), {
        clientUid,
        eqonomyId: data.eqonomyId || id,
        displayName: data.displayName || data.name || id,
        addedAt: serverTimestamp(),
      });

      setInputId("");
      setMessage("Client added!");
    } catch (err) {
      console.error(err);
      setMessage("Failed to add client");
    } finally {
      setWorking(false);
    }
  };

  const handleUnfollow = async (clientUid: string) => {
    if (!user) return;
    setWorking(true);
    try {
      await deleteDoc(doc(db, "users", user.uid, "clients", clientUid));
      setMessage("Removed from client list");
    } catch (err) {
      console.error(err);
      setMessage("Failed to remove");
    } finally {
      setWorking(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading clients…</p>
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
            <h1>Clients</h1>
            <div style={{ width: 50 }} />
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.card}>
            <h3 className={styles.sectionTitle}>Add client</h3>
            <p className={styles.hint}>
              Enter their unique Eqonomy ID (example: aarav_singh)
            </p>

            <div className={styles.addRow}>
              <span className={styles.at}>@</span>
              <input
                className={styles.input}
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                placeholder="eqonomy_id"
              />
              <button
                className={styles.addBtn}
                onClick={handleAdd}
                disabled={working}
              >
                {working ? "…" : "Add"}
              </button>
            </div>

            {message && (
              <p
                className={
                  message.includes("added") || message.includes("Removed")
                    ? styles.success
                    : styles.error
                }
              >
                {message}
              </p>
            )}
          </section>

          <section className={styles.card}>
            <h3 className={styles.sectionTitle}>
              Your clients ({clients.length})
            </h3>

            {clients.length === 0 ? (
              <p className={styles.empty}>No clients yet. Add someone by their @ID.</p>
            ) : (
              <div className={styles.list}>
                {clients.map((c) => (
                  <div key={c.clientUid} className={styles.item}>
                    <div>
                      <p className={styles.name}>{c.displayName}</p>
                      <p className={styles.id}>@{c.eqonomyId}</p>
                    </div>
                    <div className={styles.actions}>
                      {/* Ready for DM tomorrow */}
                      <button
                        className={styles.dmBtn}
                        disabled
                        title="Coming tomorrow"
                      >
                        Message
                      </button>
                      <button
                        className={styles.unfollowBtn}
                        onClick={() => handleUnfollow(c.clientUid)}
                        disabled={working}
                      >
                        Unfollow
                      </button>
                    </div>
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