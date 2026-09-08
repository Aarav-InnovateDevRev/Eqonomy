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
      // Update application
      await updateDoc(doc(db, "applications", applicationId), {
        status: "paid",
        paidAmount: totalAmount,
        seekerAmount,
        platformFee: eqonomyAmount,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Notify seeker
      const appSnap = await getDoc(doc(db, "applications", applicationId));
      const seekerId = appSnap.data()?.seekerId;

      if (seekerId) {
        await addDoc(collection(db, "notifications"), {
          userId: seekerId,
          title: "Payment completed!",
          body: `You have received payment for "${opportunityTitle}". Amount: ₹${seekerAmount}`,
          type: "payment",
          read: false,
          createdAt: serverTimestamp(),
        });
      }

      setMessage("Payment recorded successfully!");
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
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