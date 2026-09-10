"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  doc,
  getDoc,
  updateDoc,
  addDoc,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { subscribeToAuth } from "@/lib/auth";
import { User } from "firebase/auth";
import styles from "./payment.module.scss";

export default function PaymentPage() {
  const router = useRouter();
  const params = useParams();
  const applicationId = params.applicationId as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [seekerName, setSeekerName] = useState("");
  const [seekerPhone, setSeekerPhone] = useState("");
  const [opportunityTitle, setOpportunityTitle] = useState("");
  const [totalAmount, setTotalAmount] = useState(0);

  // Fixed Eqonomy number
  const EQONOMY_PHONE = "8285757406";

  useEffect(() => {
    const unsub = subscribeToAuth((u) => {
      if (!u) {
        router.push("/login");
        return;
      }
      setUser(u);
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    if (!applicationId) return;

    const load = async () => {
      try {
        const appSnap = await getDoc(doc(db, "applications", applicationId));
        if (!appSnap.exists()) {
          setMessage("Application not found");
          setLoading(false);
          return;
        }

        const data = appSnap.data();
        setSeekerName(data.seekerName || "Seeker");
        setSeekerPhone(data.seekerPhone || "Not provided");
        setOpportunityTitle(data.opportunityTitle || "Opportunity");

        // Try to get compensation from opportunity
        if (data.opportunityId) {
          const oppSnap = await getDoc(doc(db, "opportunities", data.opportunityId));
          if (oppSnap.exists()) {
            const opp = oppSnap.data();
            // Extract number from compensation string (e.g. "3000 /-" → 3000)
            const comp = opp.compensation || "0";
            const num = parseInt(comp.replace(/[^0-9]/g, ""), 10) || 0;
            setTotalAmount(num);
            setOpportunityTitle(opp.title || "Opportunity");
          }
        }
      } catch (err) {
        console.error(err);
        setMessage("Failed to load payment details");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [applicationId]);

  const seekerAmount = Math.round(totalAmount * 0.9);
  const eqonomyAmount = totalAmount - seekerAmount; // remaining 10%

  const handlePaid = async () => {
  if (!user) return;
  setSubmitting(true);
  setMessage("");

  try {
    const appRef = doc(db, "applications", applicationId);
    const appSnap = await getDoc(appRef);

    if (!appSnap.exists()) {
      setMessage("Application not found");
      setSubmitting(false);
      return;
    }

    const appData = appSnap.data();
    const seekerId = appData.seekerId;
    const providerId = user.uid;

    // 1. Update application status
    await updateDoc(appRef, {
      status: "paid",
      paidAmount: totalAmount,
      seekerAmount,
      platformFee: eqonomyAmount,
      paidAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    
    // 2. Close the opportunity so it leaves the feed
    if (appData.opportunityId) {
      await updateDoc(doc(db, "opportunities", appData.opportunityId), {
       status: "closed",
       updatedAt: serverTimestamp(),
    });
    }

    // 3. Credit Seeker wallet (90%)
    if (seekerId && seekerAmount > 0) {
      const seekerRef = doc(db, "users", seekerId);
      const seekerSnap = await getDoc(seekerRef);
      const currentBalance = seekerSnap.exists()
        ? seekerSnap.data().walletBalance || 0
        : 0;

      await updateDoc(seekerRef, {
        walletBalance: currentBalance + seekerAmount,
        updatedAt: serverTimestamp(),
      });

      // Seeker credit transaction
      await addDoc(collection(db, "transactions"), {
        userId: seekerId,
        type: "credit",
        amount: seekerAmount,
        description: `Payment received for "${opportunityTitle}"`,
        applicationId,
        createdAt: serverTimestamp(),
      });
    }

    // 4. Provider debit transaction (full amount they paid out)
    if (totalAmount > 0) {
      await addDoc(collection(db, "transactions"), {
        userId: providerId,
        type: "debit",
        amount: totalAmount,
        description: `Paid for "${opportunityTitle}" (incl. platform fee)`,
        applicationId,
        createdAt: serverTimestamp(),
      });
    }

    // 5. Platform fee record (optional tracking under a system note)
    if (eqonomyAmount > 0) {
      await addDoc(collection(db, "transactions"), {
        userId: providerId,
        type: "fee",
        amount: eqonomyAmount,
        description: `Eqonomy platform fee (10%) for "${opportunityTitle}"`,
        applicationId,
        createdAt: serverTimestamp(),
      });
    }

    // 6. Seeker reputation score update 
    
    // Increase Seeker reputation (+5)
if (seekerId) {
  const seekerRef = doc(db, "users", seekerId);
  const seekerSnap = await getDoc(seekerRef);
  const seekerRep = seekerSnap.exists()
    ? seekerSnap.data().reputationScore || 0
    : 0;

  await updateDoc(seekerRef, {
    reputationScore: seekerRep + 5,
    updatedAt: serverTimestamp(),
  });
}

// Increase Provider reputation (+2)
const providerRef = doc(db, "users", providerId);
const providerSnap = await getDoc(providerRef);
const providerRep = providerSnap.exists()
  ? providerSnap.data().reputationScore || 0
  : 0;

await updateDoc(providerRef, {
  reputationScore: providerRep + 2,
  updatedAt: serverTimestamp(),
});

    // 7. Notify seeker
    if (seekerId) {
      await addDoc(collection(db, "notifications"), {
        userId: seekerId,
        title: "Payment received!",
        body: `You received ₹${seekerAmount} for "${opportunityTitle}". Check your Wallet.`,
        type: "payment",
        read: false,
        createdAt: serverTimestamp(),
      });
    }

    setMessage("Payment recorded successfully!");
    setTimeout(() => {
      router.push("/dashboard/wallet");
    }, 1500);
  } catch (err) {
    console.error(err);
    setMessage("Failed to record payment. Please try again.");
  } finally {
    setSubmitting(false);
  }
};

  if (loading) {
    return (
      <div className={styles.loading}>
        <p>Loading payment details…</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link href="/dashboard" className={styles.back}>
          ← Back
        </Link>

        <h1 className={styles.title}>Complete Payment</h1>
        <p className={styles.subtitle}>
          {opportunityTitle} · {seekerName}
        </p>

        {/* Amount */}
        <div className={styles.amountBox}>
          <label>Total Amount (₹)</label>
          <input
            type="number"
            value={totalAmount}
            onChange={(e) => setTotalAmount(Number(e.target.value) || 0)}
            className={styles.amountInput}
            min={0}
          />
        </div>

        {/* Split Display */}
        <div className={styles.splitRow}>
          <div className={styles.splitCard}>
            <span className={styles.splitLabel}>To Seeker (90%)</span>
            <span className={styles.splitValue}>₹{seekerAmount}</span>
          </div>
          <div className={styles.splitCard}>
            <span className={styles.splitLabel}>Eqonomy Fee (10%)</span>
            <span className={styles.splitValue}>₹{eqonomyAmount}</span>
          </div>
        </div>

        {/* Payment Instructions */}
        <div className={styles.paySection}>
          <h3>1. Pay Seeker (90%)</h3>
          <p className={styles.payInfo}>
            Open GPay / PhonePe / Paytm and send <strong>₹{seekerAmount}</strong> to:
          </p>
          <div className={styles.phoneBox}>{seekerPhone}</div>
        </div>

        <div className={styles.paySection}>
          <h3>2. Pay Eqonomy (10%)</h3>
          <p className={styles.payInfo}>
            Send <strong>₹{eqonomyAmount}</strong> to:
          </p>
          <div className={styles.phoneBox}>+91 {EQONOMY_PHONE}</div>
        </div>

        <p className={styles.note}>
          After you have paid both amounts, click the button below.
        </p>

        {message && (
          <p
            className={
              message.includes("success") ? styles.success : styles.error
            }
          >
            {message}
          </p>
        )}

        <button
          className={styles.payBtn}
          onClick={handlePaid}
          disabled={submitting || totalAmount <= 0}
        >
          {submitting ? "Recording…" : "I have paid both"}
        </button>
      </div>
    </div>
  );
}