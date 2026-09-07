"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./register.module.scss";

type Step = "details" | "parent" | "credentials" | "success";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // User details
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [phone, setPhone] = useState(""); // optional self-declared

  // Parent (if minor)
  const [parentEmail, setParentEmail] = useState("");
  const [parentVerified, setParentVerified] = useState(false);

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const calculateAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a;
  };

  // Step 1: Basic details
  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !dateOfBirth) {
      setError("Please fill Name and Date of Birth");
      return;
    }

    const calculatedAge = calculateAge(dateOfBirth);
    if (calculatedAge < 13) {
      setError("You must be at least 13 years old to join Eqonomy");
      return;
    }

    setAge(calculatedAge);

    if (calculatedAge < 18) {
      setStep("parent");
    } else {
      setStep("credentials");
    }
  };

  // Step 2: Parent email (for minors)
  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!parentEmail.trim()) {
      setError("Please enter a parent email");
      return;
    }

    setParentVerified(true);
    setStep("credentials");
  };

  // Step 3: Create account
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      if (password.length < 6) {
        setError("Password must be at least 6 characters");
        setLoading(false);
        return;
      }

      // Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Update display name
      await updateProfile(user, { displayName: name });

      // Send email verification
      await sendEmailVerification(user);

      // Save profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name: name.trim(),
        phone: phone.trim() || null,
        dateOfBirth,
        age,
        isGovtVerified: false,
        isPhoneVerified: false,
        isEmailVerified: false, // will become true after user clicks the link
        isMinor: (age || 0) < 18,
        parentEmail: (age || 0) < 18 ? parentEmail : null,
        parentVerified: (age || 0) < 18 ? parentVerified : true,
        role: "seeker",
        displayName: name.trim(),
        skills: [],
        verificationStatus: "email_pending",
        walletBalance: 0,
        completedOpportunitiesCount: 0,
        reputationScore: 50,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setStep("success");
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address");
      } else {
        setError(err.message || "Failed to create account");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Eqonomy" className={styles.logoImg} />
          <span>EQONOMY</span>
        </div>

        {/* STEP 1: Details */}
        {step === "details" && (
          <>
            <h1 className={styles.title}>Create your Account</h1>
            <p className={styles.subtitle}>
              Tell us a bit about yourself to get started.
            </p>

            <form onSubmit={handleDetailsSubmit} className={styles.form}>
              <label className={styles.label}>Full Name</label>
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />

              <label className={styles.label}>Date of Birth</label>
              <input
                className={styles.input}
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />

              <label className={styles.label}>Phone Number (optional)</label>
              <input
                className={styles.input}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn}>
                Continue
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Parent (Minors) */}
        {step === "parent" && (
          <>
            <h1 className={styles.title}>Parent Email Required</h1>
            <p className={styles.subtitle}>
              You are under 18. Please provide a parent’s email address.
            </p>

            <form onSubmit={handleParentSubmit} className={styles.form}>
              <label className={styles.label}>Parent Email</label>
              <input
                className={styles.input}
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                placeholder="parent@email.com"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn}>
                Continue
              </button>
            </form>
          </>
        )}

        {/* STEP 3: Credentials */}
        {step === "credentials" && (
          <>
            <h1 className={styles.title}>Create Login Details</h1>
            <p className={styles.subtitle}>
              Set your permanent email and password.
            </p>

            <div className={styles.verifiedBox}>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Age:</strong> {age} years</p>
              {(age || 0) < 18 && (
                <p><strong>Parent Email:</strong> {parentEmail}</p>
              )}
            </div>

            <form onSubmit={handleCreateAccount} className={styles.form}>
              <label className={styles.label}>Email (this will be your login ID)</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label className={styles.label}>Password</label>
              <input
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters, Caps lock & special characters - Safety first!"
                required
              />

              <label className={styles.label}>Confirm Password</label>
              <input
                className={styles.input}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button
                type="submit"
                className={styles.primaryBtn}
                disabled={loading}
              >
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>
          </>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Account Created!🔥</h1>
            <p className={styles.subtitle}>
              We have sent a verification link to your email.
              <br />
              Please check your inbox (and spam folder) and click the link.
            </p>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
}