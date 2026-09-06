"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  isSignInWithEmailLink,
  signInWithEmailLink,
  sendSignInLinkToEmail,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showMagicLink, setShowMagicLink] = useState(false);

  // Handle Magic Link completion
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
              setError("This magic link is invalid or has already been used.");
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

  const handleSendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const actionCodeSettings = {
        url: window.location.origin + "/login",
        handleCodeInApp: true,
      };

      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      window.localStorage.setItem("emailForSignIn", email);
      setMessage("Magic link sent! Check your email (and spam folder).");
    } catch (err) {
      console.error(err);
      setError("Failed to send magic link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        {/* Left Visual Side */}
        <div className={styles.visualSide}>
          <div className={styles.visualContent}>
            <div className={styles.logoRow}>
              <img src="/logo.png" alt="Eqonomy" className={styles.logoImg} />
              <span className={styles.logoText}>EQONOMY</span>
            </div>

            <h1 className={styles.visualTitle}>
              Come as you are.<br />
              Let’s build your future, together.
            </h1>

            <p className={styles.visualSubtitle}>
              Delhi-NCR’s trusted opportunity marketplace for students, freelancers and local businesses.
            </p>

            <div className={styles.pillars}>
              <div className={styles.pillar}>
                <span>🛡️</span>
                <p>Verified Profiles</p>
              </div>
              <div className={styles.pillar}>
                <span>💼</span>
                <p>Real Opportunities</p>
              </div>
              <div className={styles.pillar}>
                <span>🤝</span>
                <p>Trusted Network</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Form Side */}
        <div className={styles.formSide}>
          <div className={styles.formCard}>
            {!showMagicLink ? (
              <>
                <h2 className={styles.formTitle}>Get Started</h2>
                <p className={styles.formSubtitle}>
                  Verify your identity and join Eqonomy in minutes.
                </p>

                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => router.push("/register")}
                >
                  Let’s Begin →
                </button>

                <div className={styles.divider}>
                  <span>or</span>
                </div>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setShowMagicLink(true)}
                >
                  Login with Magic Link
                </button>
              </>
            ) : (
              <>
                <h2 className={styles.formTitle}>Magic Link Login</h2>
                <p className={styles.formSubtitle}>
                  Enter your email and we’ll send you a secure login link.
                </p>

                <form onSubmit={handleSendMagicLink} className={styles.form}>
                  <label className={styles.label}>Email address</label>
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
                  className={styles.backLink}
                  onClick={() => {
                    setShowMagicLink(false);
                    setError("");
                    setMessage("");
                  }}
                >
                  ← Back
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}