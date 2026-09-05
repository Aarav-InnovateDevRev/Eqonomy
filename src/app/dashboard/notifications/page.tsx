"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import styles from "./notifications.module.scss";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  link?: string;
  createdAt: number;
}

export default function NotificationsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
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

  // Real-time notifications
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "notifications"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const list: NotificationItem[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          list.push({
            id: docSnap.id,
            title: data.title,
            body: data.body,
            type: data.type || "system",
            read: data.read || false,
            link: data.link || "",
            createdAt:
              data.createdAt instanceof Timestamp
                ? data.createdAt.toMillis()
                : Date.now(),
          });
        });
        setNotifications(list);
        setLoading(false);
      },
      (err) => {
        console.error("Notifications error:", err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), {
        read: true,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;
    const unread = notifications.filter((n) => !n.read);
    if (unread.length === 0) return;

    const batch = writeBatch(db);
    unread.forEach((n) => {
      batch.update(doc(db, "notifications", n.id), { read: true });
    });
    await batch.commit();
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "application":
        return "📨";
      case "match":
        return "🎯";
      case "milestone":
        return "🏁";
      case "payment":
        return "💰";
      case "system":
      default:
        return "🔔";
    }
  };

  const formatTime = (timestamp: number) => {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading notifications…</p>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/dashboard" className={styles.back}>
              ← Back
            </Link>
            <h1>Notifications</h1>
            {unreadCount > 0 ? (
              <button onClick={markAllAsRead} className={styles.markAll}>
                Mark all read
              </button>
            ) : (
              <div style={{ width: 80 }} />
            )}
          </div>
        </header>

        <div className={styles.content}>
          {notifications.length === 0 ? (
            <div className={styles.empty}>
              <div className={styles.emptyIcon}>🔔</div>
              <h3>No notifications yet</h3>
              <p>
                When someone applies to your opportunity or you get a match,
                it will appear here.
              </p>
            </div>
          ) : (
            <div className={styles.list}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`${styles.item} ${!n.read ? styles.unread : ""}`}
                  onClick={() => {
                    if (!n.read) markAsRead(n.id);
                    if (n.link) router.push(n.link);
                  }}
                >
                  <div className={styles.icon}>{getIcon(n.type)}</div>
                  <div className={styles.body}>
                    <div className={styles.topRow}>
                      <h4>{n.title}</h4>
                      <span className={styles.time}>
                        {formatTime(n.createdAt)}
                      </span>
                    </div>
                    <p>{n.body}</p>
                  </div>
                  {!n.read && <div className={styles.dot} />}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </>
  );
}