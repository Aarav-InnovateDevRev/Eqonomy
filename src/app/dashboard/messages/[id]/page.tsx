"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import styles from "./chat.module.scss";

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  createdAt: number;
}

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [otherName, setOtherName] = useState("Chat");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

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
    if (!user || !conversationId) return;

    const loadMeta = async () => {
      const snap = await getDoc(doc(db, "conversations", conversationId));
      if (snap.exists()) {
        const data = snap.data();
        const otherUid = (data.participants || []).find(
          (p: string) => p !== user.uid
        );
        setOtherName(data.names?.[otherUid] || "User");
      }
      setLoading(false);
    };
    loadMeta();

    const q = query(
      collection(db, "conversations", conversationId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsub = onSnapshot(q, (snap) => {
      const list: ChatMessage[] = [];
      snap.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          senderId: data.senderId,
          text: data.text,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
        });
      });
      setMessages(list);
    });

    return () => unsub();
  }, [user, conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!user || !text.trim() || sending) return;
    setSending(true);

    try {
      const msg = text.trim();
      await addDoc(collection(db, "conversations", conversationId, "messages"), {
        senderId: user.uid,
        text: msg,
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, "conversations", conversationId), {
        lastMessage: msg,
        updatedAt: serverTimestamp(),
      });

      setText("");
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading chat…</p>
      </div>
    );
  }

  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/dashboard/messages" className={styles.back}>
              ← Back
            </Link>
            <h1>{otherName}</h1>
            <div style={{ width: 50 }} />
          </div>
        </header>

        <div className={styles.messages}>
          {messages.length === 0 && (
            <p className={styles.emptyChat}>Say hello 👋</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`${styles.bubble} ${
                m.senderId === user?.uid ? styles.mine : styles.theirs
              }`}
            >
              {m.text}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className={styles.inputBar}>
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            disabled={sending}
          />
          <button onClick={handleSend} disabled={sending || !text.trim()}>
            Send
          </button>
        </div>
      </main>

      <BottomNav />
    </>
  );
}