"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  RecaptchaVerifier,
  signInWithPhoneNumber,
  createUserWithEmailAndPassword,
  updateProfile,
  PhoneAuthProvider,
  signInWithCredential,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./register.module.scss";

declare global {
  interface Window {
    recaptchaVerifier: any;
  }
}

type Step = "details" | "otp" | "parent" | "parent-otp" | "credentials" | "success";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // User details
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);

  // OTP
  const [otp, setOtp] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<any>(null);

  // Parent
  const [parentPhone, setParentPhone] = useState("");
  const [parentOtp, setParentOtp] = useState("");
  const [parentConfirmation, setParentConfirmation] = useState<any>(null);
  const [parentVerified, setParentVerified] = useState(false);

  // Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Setup reCAPTCHA
  useEffect(() => {
    if (typeof window !== "undefined" && !window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
      });
    }
  }, []);

  const calculateAge = (dob: string): number => {
    const birth = new Date(dob);
    const today = new Date();
    let a = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) a--;
    return a;
  };

  // Step 1: Submit details + send OTP
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !phone.trim() || !dateOfBirth) {
      setError("Please fill all fields");
      return;
    }

    if (phone.length !== 10) {
      setError("Enter a valid 10-digit phone number");
      return;
    }

    const calculatedAge = calculateAge(dateOfBirth);
    if (calculatedAge < 13) {
      setError("You must be at least 13 years old");
      return;
    }

    setAge(calculatedAge);
    setLoading(true);

    try {
      const appVerifier = window.recaptchaVerifier;
      const formattedPhone = "+91" + phone;

      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setConfirmationResult(result);
      setStep("otp");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await confirmationResult.confirm(otp);

      if ((age || 0) < 18) {
        setStep("parent");
      } else {
        setStep("credentials");
      }
    } catch (err) {
      setError("Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Parent phone + OTP
  const handleParentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (parentPhone.length !== 10) {
      setError("Enter a valid parent phone number");
      return;
    }

    setLoading(true);
    try {
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, "+91" + parentPhone, appVerifier);
      setParentConfirmation(result);
      setStep("parent-otp");
    } catch (err: any) {
      setError(err.message || "Failed to send parent OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleParentOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await parentConfirmation.confirm(parentOtp);
      setParentVerified(true);
      setStep("credentials");
    } catch (err) {
      setError("Invalid parent OTP");
    } finally {
      setLoading(false);
    }
  };

  // Step 4: Create permanent account
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

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name: name.trim(),
        phone: phone.trim(),
        dateOfBirth,
        age,
        isGovtVerified: false,
        isPhoneVerified: true,
        isMinor: (age || 0) < 18,
        parentPhone: (age || 0) < 18 ? parentPhone : null,
        parentVerified: (age || 0) < 18 ? parentVerified : true,
        role: "seeker",
        displayName: name.trim(),
        skills: [],
        verificationStatus: "phone_verified",
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
      <div id="recaptcha-container"></div>

      <div className={styles.card}>
        <div className={styles.logo}>
          <img src="/logo.png" alt="Eqonomy" className={styles.logoImg} />
          <span>EQONOMY</span>
        </div>

        {/* STEP: Details */}
        {step === "details" && (
          <>
            <h1 className={styles.title}>Create your Account</h1>
            <p className={styles.subtitle}>
              Verify your phone number to join Eqonomy.
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

              <label className={styles.label}>Phone Number</label>
              <input
                className={styles.input}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
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

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP: OTP */}
        {step === "otp" && (
          <>
            <h1 className={styles.title}>Enter OTP</h1>
            <p className={styles.subtitle}>
              We sent a code to +91 {phone}
            </p>

            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <label className={styles.label}>OTP</label>
              <input
                className={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Verifying…" : "Verify OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP: Parent Phone */}
        {step === "parent" && (
          <>
            <h1 className={styles.title}>Parent Verification</h1>
            <p className={styles.subtitle}>
              You are under 18. Please verify a parent’s phone number.
            </p>

            <form onSubmit={handleParentSubmit} className={styles.form}>
              <label className={styles.label}>Parent Phone Number</label>
              <input
                className={styles.input}
                type="tel"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="Parent's 10-digit number"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Sending OTP…" : "Send Parent OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP: Parent OTP */}
        {step === "parent-otp" && (
          <>
            <h1 className={styles.title}>Enter Parent OTP</h1>
            <p className={styles.subtitle}>
              Code sent to +91 {parentPhone}
            </p>

            <form onSubmit={handleParentOtpSubmit} className={styles.form}>
              <label className={styles.label}>OTP</label>
              <input
                className={styles.input}
                value={parentOtp}
                onChange={(e) => setParentOtp(e.target.value)}
                placeholder="Enter 6-digit OTP"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Verifying…" : "Verify Parent"}
              </button>
            </form>
          </>
        )}

        {/* STEP: Credentials */}
        {step === "credentials" && (
          <>
            <h1 className={styles.title}>Create Login Details</h1>
            <p className={styles.subtitle}>
              Your phone is verified. Now set your permanent login.
            </p>

            <div className={styles.verifiedBox}>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Phone:</strong> +91 {phone} ✓</p>
              <p><strong>Age:</strong> {age} years</p>
              {(age || 0) < 18 && <p><strong>Parent:</strong> Verified ✓</p>}
            </div>

            <form onSubmit={handleCreateAccount} className={styles.form}>
              <label className={styles.label}>Email (will be your login ID)</label>
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
                placeholder="Minimum 6 characters"
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

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Creating Account…" : "Create Account"}
              </button>
            </form>
          </>
        )}

        {/* SUCCESS */}
        {step === "success" && (
          <div className={styles.success}>
            <div className={styles.successIcon}>✓</div>
            <h1 className={styles.title}>Account Created!</h1>
            <p className={styles.subtitle}>Your verified account is ready.</p>
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