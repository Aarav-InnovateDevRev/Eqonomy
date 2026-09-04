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
  const [step, setStep] = useState<"intro" | "email">("intro");

  // Handle returning from email link
  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem("emailForSignIn");

        if (!emailForSignIn) {
          emailForSignIn = window.prompt("Please confirm your email");
        }

        if (emailForSignIn) {
          try {
            setLoading(true);
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            router.push("/dashboard");
          } catch (err) {
            console.error(err);
            setError("Sign-in failed. Please try again.");
            setLoading(false);
          }
        }
      }
    };

    completeSignIn();
  }, [router]);

  const handleSendLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const actionCodeSettings = {
      url: window.location.origin + "/login",
      handleCodeInApp: true,
    };

    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setSent(true);
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
      {/* Left / Top visual side */}
      <section className={styles.visual}>
        <div className={styles.visualInner}>
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>✦</span>
            <span className={styles.logoText}>EQONOMY</span>
          </div>

          <h1 className={styles.headline}>
            Want to do It?
          </h1>
          <p className={styles.subheadline}>
            Real opportunities from local businesses, startups & professionals.
            <br />
            No pedigree required.
          </p>

          <div className={styles.pillars}>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>📍</div>
              <div>
                <strong>Delhi-First</strong>
                <span>Hyper-local density</span>
              </div>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>🏠</div>
              <div>
                <strong>Hosts-First</strong>
                <span>We onboard providers first</span>
              </div>
            </div>
            <div className={styles.pillar}>
              <div className={styles.pillarIcon}>✓</div>
              <div>
                <strong>Proof of Work</strong>
                <span>Real completed projects</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Right / Bottom form side */}
      <section className={styles.formSide}>
        <div className={styles.formCard}>
          {sent ? (
            <div className={styles.successState}>
              <div className={styles.successIcon}>✉️</div>
              <h2>Check your email</h2>
              <p>
                We sent a magic link to<br />
                <strong>{email}</strong>
              </p>
              <p className={styles.hint}>
                Click the link to enter Eqonomy.<br />
                (Sometimes it lands in Spam — check there too)
              </p>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setSent(false);
                  setEmail("");
                }}
              >
                Use a different email
              </button>
            </div>
          ) : step === "intro" ? (
            <div className={styles.introState}>
              <h2>Come as you are.</h2>
              <p className={styles.introText}>
                No long forms. No passwords.<br />
                Just one email and you’re in.
              </p>

              <button
                className={styles.primaryBtn}
                onClick={() => setStep("email")}
              >
                Let’s Begin →
              </button>

              <p className={styles.privacy}>
                🔒 Passwordless • Private • Delhi-first
              </p>
            </div>
          ) : (
            <form onSubmit={handleSendLink} className={styles.emailForm}>
              <button
                type="button"
                className={styles.backBtn}
                onClick={() => setStep("intro")}
              >
                ← Back
              </button>

              <h2>Enter your email</h2>
              <p className={styles.formSub}>
                We’ll send you a one-click magic link.
              </p>

              <label className={styles.label}>Email address</label>
              <input
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

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading || !email}
              >
                {loading ? "Sending…" : "Send Magic Link"}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}