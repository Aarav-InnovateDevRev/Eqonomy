"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState<"intro" | "email" | "success">("intro");

  // Handle Magic Link completion (for existing users)
  useEffect(() => {
    const completeSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        let emailForSignIn = window.localStorage.getItem("emailForSignIn");

        if (!emailForSignIn) {
          emailForSignIn = window.prompt("Please provide your email for confirmation");
        }

        if (emailForSignIn) {
          try {
            setLoading(true);
            await signInWithEmailLink(auth, emailForSignIn, window.location.href);
            window.localStorage.removeItem("emailForSignIn");
            window.history.replaceState({}, document.title, "/login");
            router.push("/dashboard");
          } catch (err: any) {
            console.error(err);
            if (err.code === "auth/invalid-action-code") {
              setError("This magic link is invalid or has already been used. Please request a new one.");
            } else {
              setError("Failed to sign in. Please try again.");
            }
            window.history.replaceState({}, document.title, "/login");
          } finally {
            setLoading(false);
          }
        }
      }
    };

    completeSignIn();
  }, [router]);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <img src="/logo.png" alt="Eqonomy" className={styles.logoImg} />
          <span className={styles.logoText}>EQONOMY</span>
        </div>

        {step === "intro" && (
          <>
            <h1 className={styles.title}>Welcome to Eqonomy</h1>
            <p className={styles.subtitle}>
              Delhi-NCR’s opportunity marketplace. Verify your identity and start building.
            </p>

            <div className={styles.features}>
              <div className={styles.feature}>
                <span>🛡️</span>
                <p>Government-style verification</p>
              </div>
              <div className={styles.feature}>
                <span>💼</span>
                <p>Real projects & guidance</p>
              </div>
              <div className={styles.feature}>
                <span>🔒</span>
                <p>Trusted profiles</p>
              </div>
            </div>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => router.push("/register")}
            >
              Let’s Begin →
            </button>

            <p className={styles.footer}>
              Already have an account?{" "}
              <button
                type="button"
                className={styles.linkBtn}
                onClick={() => setStep("email")}
              >
                Login with Magic Link
              </button>
            </p>
          </>
        )}

        {step === "email" && (
          <>
            <h1 className={styles.title}>Login with Magic Link</h1>
            <p className={styles.subtitle}>
              Enter your email and we’ll send you a secure login link.
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setLoading(true);
                setError("");
                setMessage("");

                try {
                  const actionCodeSettings = {
                    url: window.location.origin + "/login",
                    handleCodeInApp: true,
                  };

                  const { sendSignInLinkToEmail } = await import("firebase/auth");
                  await sendSignInLinkToEmail(auth, email, actionCodeSettings);
                  window.localStorage.setItem("emailForSignIn", email);
                  setMessage("Magic link sent! Check your email (and spam folder).");
                  setStep("success");
                } catch (err: any) {
                  console.error(err);
                  setError("Failed to send magic link. Please try again.");
                } finally {
                  setLoading(false);
                }
              }}
              className={styles.form}
            >
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              {error && <p className={styles.error}>{error}</p>}
              {message && <p className={styles.success}>{message}</p>}

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
              >
                {loading ? "Sending…" : "Send Magic Link"}
              </button>
            </form>

            <button
              type="button"
              className={styles.backBtn}
              onClick={() => setStep("intro")}
            >
              ← Back
            </button>
          </>
        )}

        {step === "success" && (
          <div className={styles.successBox}>
            <div className={styles.successIcon}>✓</div>
            <h2>Check your email</h2>
            <p>We sent a magic link to <strong>{email}</strong></p>
            <p className={styles.note}>Also check your spam folder.</p>
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setStep("intro")}
            >
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}