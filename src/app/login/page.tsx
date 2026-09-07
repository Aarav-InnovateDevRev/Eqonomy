"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import styles from "./login.module.scss";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setError("Invalid email or password");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password");
      } else {
        setError("Failed to login. Please try again.");
      }
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
            <h2 className={styles.formTitle}>Welcome back</h2>
            <p className={styles.formSubtitle}>
              Log in with your Eqonomy account.
            </p>

            <form onSubmit={handleLogin} className={styles.form}>
              <label className={styles.label}>Email</label>
              <input
                type="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label className={styles.label}>Password</label>
              <input
                type="password"
                className={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
              >
                {loading ? "Logging in…" : "Log In"}
              </button>
            </form>

            <p className={styles.footer}>
              Don’t have an account?{" "}
              <Link href="/register">Create Account</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}