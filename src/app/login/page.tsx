"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import {
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(""); // for success messages

  // This runs when the user comes back by clicking the link in their email
  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem("emailForSignIn");

        if (!emailForSignIn) {
          // User opened the link on a different device
          emailForSignIn = window.prompt("Please provide your email for confirmation");
        }

        if (emailForSignIn) {
          try {
            setLoading(true);
            setStatus("Signing you in...");
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            setStatus("Success! Redirecting...");
            router.push("/dashboard");
          } catch (err: any) {
            console.error(err);
            setError("Failed to complete sign-in. Please try again.");
            setLoading(false);
          }
        }
      }
    };

    completeSignIn();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    const actionCodeSettings = {
      // This must be the page where the user will land after clicking the email link
      url: window.location.origin + "/login",
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      // Save the email locally so we can complete sign-in later
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
      setStatus("Magic link sent! Check your email.");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/invalid-email") {
        setError("Please enter a valid email address.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <Link href="/" className={styles.back}>
          ← Back
        </Link>

        <h1 className={styles.title}>EQONOMY</h1>
        <p className={styles.subtitle}>Passwordless Magic Link</p>

        {sent ? (
          <div className={styles.success}>
            <h2>Check your email</h2>
            <p>
              We sent a sign-in link to <strong>{email}</strong>.
            </p>
            <p className={styles.small}>
              Click the link in the email to enter Eqonomy.
            </p>
            <button
              className={styles.secondaryBtn}
              onClick={() => {
                setSent(false);
                setEmail("");
                setStatus("");
              }}
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className={styles.form}>
            <label htmlFor="email" className={styles.label}>
              Email address
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={styles.input}
              autoComplete="email"
              disabled={loading}
            />

            {error && <p className={styles.error}>{error}</p>}
            {status && <p className={styles.status}>{status}</p>}

            <button
              type="submit"
              className={styles.primaryBtn}
              disabled={loading || !email}
            >
              {loading ? "Sending link…" : "Send Magic Link"}
            </button>
          </form>
        )}

        <p className={styles.note}>
          No password needed. One click and you are in.
        </p>
      </div>
    </main>
  );
}