"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./register.module.scss";

type Step = "aadhaar" | "parent" | "credentials" | "success";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("aadhaar");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Aadhaar / Verified data
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);

  // Parent verification (if minor)
  const [parentPhone, setParentPhone] = useState("");
  const [parentOtp, setParentOtp] = useState("");
  const [parentVerified, setParentVerified] = useState(false);

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Calculate age from DOB
  const calculateAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let calculatedAge = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      calculatedAge--;
    }
    return calculatedAge;
  };

  const handleAadhaarSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !dateOfBirth) {
      setError("Please fill all fields");
      return;
    }

    if (phone.length < 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    const calculatedAge = calculateAge(dateOfBirth);
    setAge(calculatedAge);

    if (calculatedAge < 13) {
      setError("You must be at least 13 years old to join Eqonomy");
      return;
    }

    if (calculatedAge < 18) {
      setStep("parent");
    } else {
      setStep("credentials");
    }
  };

  const handleParentVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!parentPhone || parentPhone.length < 10) {
      setError("Enter a valid parent phone number");
      return;
    }

    // Mock OTP – in real version we will send actual OTP
    if (parentOtp !== "123456") {
      setError("Invalid OTP. For testing use: 123456");
      return;
    }

    setParentVerified(true);
    setStep("credentials");
  };

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

      // Create verified profile in Firestore
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name: name.trim(),
        phone: phone.trim(),
        dateOfBirth,
        age,
        isGovtVerified: true,
        isMinor: (age || 0) < 18,
        parentPhone: (age || 0) < 18 ? parentPhone : null,
        parentVerified: (age || 0) < 18 ? parentVerified : true,
        role: "seeker",
        displayName: name.trim(),
        skills: [],
        verificationStatus: "verified",
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

        {/* STEP 1: Aadhaar / Identity */}
        {step === "aadhaar" && (
          <>
            <h1>Verify your Identity</h1>
            <p className={styles.subtitle}>
              This is a temporary mock verification. Later this will connect to Aadhaar / DigiLocker.
            </p>

            <form onSubmit={handleAadhaarSubmit} className={styles.form}>
              <label>Full Name (as per Aadhaar)</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                required
              />

              <label>Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                required
              />

              <label>Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn}>
                Continue
              </button>
            </form>
          </>
        )}

        {/* STEP 2: Parent Verification (Minors) */}
        {step === "parent" && (
          <>
            <h1>Parent Verification Required</h1>
            <p className={styles.subtitle}>
              You are under 18. Please verify a parent’s phone number.
            </p>

            <form onSubmit={handleParentVerify} className={styles.form}>
              <label>Parent Phone Number</label>
              <input
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Parent's 10-digit number"
                required
              />

              <label>Enter OTP</label>
              <input
                type="text"
                value={parentOtp}
                onChange={(e) => setParentOtp(e.target.value)}
                placeholder="Enter OTP (use 123456 for testing)"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn}>
                Verify Parent
              </button>
            </form>
          </>
        )}

        {/* STEP 3: Create Credentials */}
        {step === "credentials" && (
          <>
            <h1>Create your Account</h1>
            <p className={styles.subtitle}>
              Your identity has been verified. Now set your login details.
            </p>

            <div className={styles.verifiedBox}>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Phone:</strong> {phone}</p>
              <p><strong>Age:</strong> {age} years</p>
              {(age || 0) < 18 && (
                <p><strong>Parent Verified:</strong> Yes</p>
              )}
            </div>

            <form onSubmit={handleCreateAccount} className={styles.form}>
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                required
              />

              <label>Confirm Password</label>
              <input
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

        {/* STEP 4: Success */}
        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h1>Account Created!</h1>
            <p>Your government-verified account is ready.</p>
            <button
              className={styles.primaryBtn}
              onClick={() => router.push("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        )}

        <p className={styles.footer}>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}