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
} from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import styles from "./wallet.module.scss";

interface Transaction {
  id: string;
  type: "credit" | "debit" | "fee" | "support";
  amount: number;
  description: string;
  createdAt: number;
}

const FOUNDER_UPI_PHONE = "8285757406";

export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
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
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Live transactions
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          type: data.type,
          amount: data.amount,
          description: data.description,
          createdAt: data.createdAt?.toMillis?.() || Date.now(),
        });
      });
      setTransactions(list);
    });

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.loadingScreen}>
        <p>Loading wallet…</p>
      </div>
    );
  }

  const balance = profile?.walletBalance || 0;

  return (
    <>
      <main className={`${styles.page} page-with-bottom-nav`}>
        <header className={styles.header}>
          <div className={styles.headerInner}>
            <Link href="/dashboard" className={styles.back}>
              ← Back
            </Link>
            <h1>Wallet</h1>
            <div style={{ width: 50 }} />
          </div>
        </header>

        <div className={styles.content}>
          {/* Balance Card – same UI */}
          <section className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <h2 className={styles.balanceAmount}>
              ₹{balance.toLocaleString("en-IN")}
            </h2>
            <p className={styles.balanceNote}>
              Payments from completed work appear here after the provider
              confirms payment.
            </p>
          </section>

          {/* How it works – updated, no demo deposit */}
          <section className={styles.infoCard}>
            <h3>How it works</h3>
            <ul>
              <li>When a provider pays you for completed work, your 90% is recorded here</li>
              <li>Eqonomy’s 10% platform fee is tracked separately</li>
              <li>No demo top-ups — only real payment confirmations</li>
            </ul>
          </section>

          {/* Transactions – same UI */}
          <section className={styles.transactions}>
            <h3>Recent Transactions</h3>
            {transactions.length === 0 ? (
              <p className={styles.empty}>No transactions yet</p>
            ) : (
              <div className={styles.txList}>
                {transactions.map((tx) => (
                  <div key={tx.id} className={styles.txItem}>
                    <div>
                      <p className={styles.txDesc}>{tx.description}</p>
                      <p className={styles.txDate}>
                        {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span
                      className={`${styles.txAmount} ${
                        tx.type === "credit" || tx.type === "support"
                          ? styles.credit
                          : styles.debit
                      }`}
                    >
                      {tx.type === "debit" ? "-" : "+"}₹{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Support founder – small area at bottom */}
          <section className={styles.supportCard}>
            <p className={styles.supportText}>
              You can support me by giving feedback or paying any generous
              amount you like, OR simply by using Eqonomy nicely 😄
            </p>
            <p className={styles.supportUpi}>
              Support via UPI / PhonePe / GPay:
              <br />
              <strong>+91 {FOUNDER_UPI_PHONE}</strong>
            </p>
          </section>
        </div>
      </main>

      <BottomNav />
    </>
  );
}