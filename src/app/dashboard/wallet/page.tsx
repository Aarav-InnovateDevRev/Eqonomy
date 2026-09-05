"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "firebase/auth";
import { doc, updateDoc, collection, addDoc, serverTimestamp, query, where, orderBy, onSnapshot } from "firebase/firestore";
import BottomNav from "@/components/layout/BottomNav";
import { subscribeToAuth, ensureUserProfile } from "@/lib/auth";
import { db } from "@/lib/firebase";
import { UserProfile } from "@/types";
import styles from "./wallet.module.scss";

interface Transaction {
  id: string;
  type: "credit" | "debit" | "fee" | "redeem";
  amount: number;
  description: string;
  createdAt: number;
}

export default function WalletPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState("");

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

  // Load transactions
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "transactions"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Transaction[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        list.push({
          id: doc.id,
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

  const handleAddMoney = async (amount: number) => {
    if (!user || !profile) return;
    setProcessing(true);
    setMessage("");

    try {
      const newBalance = (profile.walletBalance || 0) + amount;

      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: newBalance,
        updatedAt: Date.now(),
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "credit",
        amount,
        description: `Added ₹${amount} to wallet`,
        createdAt: serverTimestamp(),
      });

      setProfile({ ...profile, walletBalance: newBalance });
      setMessage(`₹${amount} added successfully!`);
    } catch (err) {
      console.error(err);
      setMessage("Failed to add money. Try again.");
    } finally {
      setProcessing(false);
    }
  };

  const handleRedeem = async () => {
    if (!user || !profile || (profile.walletBalance || 0) <= 0) return;
    setProcessing(true);
    setMessage("");

    try {
      const amount = profile.walletBalance || 0;

      await updateDoc(doc(db, "users", user.uid), {
        walletBalance: 0,
        updatedAt: Date.now(),
      });

      await addDoc(collection(db, "transactions"), {
        userId: user.uid,
        type: "redeem",
        amount,
        description: `Redeemed ₹${amount}`,
        createdAt: serverTimestamp(),
      });

      setProfile({ ...profile, walletBalance: 0 });
      setMessage(`₹${amount} redemption requested!`);
    } catch (err) {
      console.error(err);
      setMessage("Redemption failed. Try again.");
    } finally {
      setProcessing(false);
    }
  };

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
          {/* Balance Card */}
          <section className={styles.balanceCard}>
            <p className={styles.balanceLabel}>Available Balance</p>
            <h2 className={styles.balanceAmount}>₹{balance.toLocaleString("en-IN")}</h2>
            <p className={styles.balanceNote}>All payments for work & guidance happen inside Eqonomy</p>
          </section>

          {/* Actions */}
          <section className={styles.actions}>
            <button
              className={styles.addBtn}
              onClick={() => handleAddMoney(500)}
              disabled={processing}
            >
              {processing ? "Processing…" : "Add ₹500 (Test)"}
            </button>
            <button
              className={styles.redeemBtn}
              onClick={handleRedeem}
              disabled={processing || balance <= 0}
            >
              Redeem All
            </button>
          </section>

          {message && (
            <p className={message.includes("success") || message.includes("Added") || message.includes("redemption") ? styles.successMsg : styles.errorMsg}>
              {message}
            </p>
          )}

          {/* Info */}
          <section className={styles.infoCard}>
            <h3>How it works</h3>
            <ul>
              <li>Add money to your Eqonomy wallet</li>
              <li>Pay for guidance or release payments for completed work</li>
              <li>Eqonomy keeps 10% platform fee on paid transactions</li>
              <li>Redeem remaining balance anytime</li>
            </ul>
          </section>

          {/* Transactions */}
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
                        tx.type === "credit" ? styles.credit : styles.debit
                      }`}
                    >
                      {tx.type === "credit" ? "+" : "-"}₹{tx.amount}
                    </span>
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