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
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle returning from email link
  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsCompleting(true);
        let emailForSignIn = window.localStorage.getItem("emailForSignIn");

        // If email is missing (different device), ask the user
        if (!emailForSignIn) {
          emailForSignIn = window.prompt(
            "Please enter the same email you used to request the magic link:"
          );
        }

        if (!emailForSignIn) {
          setError("Email is required to complete sign-in.");
          setIsCompleting(false);
          return;
        }

        try {
          setLoading(true);
          await signInWithEmailLink(auth, emailForSignIn, window.location.href);
          window.localStorage.removeItem("emailForSignIn");

          // Clean the URL so the action code is not reused
          window.history.replaceState({}, document.title, "/login");

          router.push("/dashboard");
        } catch (err: any) {
          console.error("Sign-in error:", err);

          if (err.code === "auth/invalid-action-code") {
            setError(
              "This magic link is invalid or has already been used. Please request a new one."
            );
          } else if (err.code === "auth/invalid-email") {
            setError("The email you entered does not match the link.");
          } else {
            setError("Sign-in failed. Please request a new magic link.");
          }

          // Clean the bad link from the URL
          window.history.replaceState({}, document.title, "/login");
          setIsCompleting(false);
          setLoading(false);
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
      await sendSignInLinkToEmail(auth, email.trim(), actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email.trim());
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

  // Show loading while completing sign-in from email link
  if (isCompleting && !error) {
    return (
      <main className={styles.page}>
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            <div className={styles.successState}>
              <h2>Signing you in…</h2>
              <p>Please wait a moment.</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* Left visual side */}
      <section className={styles.visual}>
        <div className={styles.visualInner}>
          <div className={styles.logoRow}>
            <img src="/logo.png" alt="Eqonomy" className={styles.logoImg} />
            <span className={styles.logoText}>EQONOMY</span>
          </div>

          <h1 className={styles.headline}>Want to do It?</h1>
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

      {/* Right form side */}
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
                Click the newest link only once.
                <br />
                (Check Spam folder if you don’t see it)
              </p>
              <button
                className={styles.secondaryBtn}
                onClick={() => {
                  setSent(false);
                  setEmail("");
                  setError("");
                }}
              >
                Use a different email
              </button>
            </div>
          ) : step === "intro" ? (
            <div className={styles.introState}>
              <h2>Come as you are.</h2>
              <p className={styles.introText}>
                No long forms. No passwords.
                <br />
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
                onClick={() => {
                  setStep("intro");
                  setError("");
                }}
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

          {/* Show error even on intro/success if it came from a bad link */}
          {error && step === "intro" && (
            <p className={styles.error} style={{ marginTop: "1rem", textAlign: "center" }}>
              {error}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}