"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import styles from "./messages.module.scss";

interface ConversationItem {
  id: string;
  otherUid: string;
  otherName: string;
  otherEqonomyId?: string;
  lastMessage?: string;
  updatedAt?: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);

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

    const q = query(
      collection(db, "conversations"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    const unsub = onSnapshot(
      q,
      (snap) => {
        const list: ConversationItem[] = [];
        snap.forEach((d) => {
          const data = d.data();
          const otherUid =
            (data.participants || []).find((p: string) => p !== user.uid) || "";
          list.push({
            id: d.id,
            otherUid,
            otherName: data.names?.[otherUid] || "User",
            otherEqonomyId: data.eqonomyIds?.[otherUid] || "",
            lastMessage: data.lastMessage || "",
            updatedAt: data.updatedAt?.toMillis?.() || Date.now(),
          });
        });
        setConversations(list);
        setLoading(false);
      },
      (err) => {
        console.error(err);
        setLoading(false);
      }
    );

    return () => unsub();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading messages…</p>
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
            <h1>Messages</h1>
            <div style={{ width: 50 }} />
          </div>
        </header>

        <div className={styles.content}>
          {conversations.length === 0 ? (
            <div className={styles.empty}>
              <p>No conversations yet.</p>
              <p className={styles.hint}>
                Go to <Link href="/dashboard/clients">Clients</Link> and tap
                Message to start a chat.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {conversations.map((c) => (
                <Link
                  key={c.id}
                  href={`/dashboard/messages/${c.id}`}
                  className={styles.item}
                >
                  <div className={styles.avatar}>
                    {(c.otherName || "U").charAt(0).toUpperCase()}
                  </div>
                  <div className={styles.meta}>
                    <p className={styles.name}>{c.otherName}</p>
                    {c.otherEqonomyId && (
                      <p className={styles.id}>@{c.otherEqonomyId}</p>
                    )}
                    <p className={styles.preview}>
                      {c.lastMessage || "No messages yet"}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}