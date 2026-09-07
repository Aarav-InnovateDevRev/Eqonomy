"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import emailjs from "@emailjs/browser";
import {
  createUserWithEmailAndPassword,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import styles from "./register.module.scss";

type Step = "details" | "otp" | "parent" | "credentials" | "success";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState<Step>("details");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // User details
  const [name, setName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [age, setAge] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  // OTP
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");

  // Parent
  const [parentEmail, setParentEmail] = useState("");
  const [parentVerified, setParentVerified] = useState(false);

  // Password
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

  // Generate 6-digit OTP
  const generateOtp = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  // Step 1: Collect details + send OTP
  const handleDetailsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim() || !dateOfBirth || !email.trim()) {
      setError("Please fill Name, Date of Birth and Email");
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
      const newOtp = generateOtp();
      setGeneratedOtp(newOtp);

      // Send OTP via EmailJS
      await emailjs.send(
        "service_e0b45ub",
        "template_0kdlgsm",
        {
          name: name,
          otp: newOtp,
          email: email,
        },
        "dmAfk8l3ozaC8edvF"
      );

      setStep("otp");
    } catch (err) {
      console.error(err);
      setError("Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    if ((age || 0) < 18) {
      setStep("parent");
    } else {
      setStep("credentials");
    }
  };

  // Step 3: Parent email (minors)
  const handleParentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!parentEmail.trim()) {
      setError("Please enter parent email");
      return;
    }

    setParentVerified(true);
    setStep("credentials");
  };

  // Step 4: Create account
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

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await updateProfile(user, { displayName: name });

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email,
        name: name.trim(),
        phone: phone.trim() || null,
        dateOfBirth,
        age,
        isGovtVerified: false,
        isEmailVerified: true,
        isPhoneVerified: false,
        isMinor: (age || 0) < 18,
        parentEmail: (age || 0) < 18 ? parentEmail : null,
        parentVerified: (age || 0) < 18 ? parentVerified : true,
        role: "seeker",
        displayName: name.trim(),
        skills: [],
        verificationStatus: "email_verified",
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

        {/* STEP 1: Details */}
        {step === "details" && (
          <>
            <h1 className={styles.title}>Create your Account</h1>
            <p className={styles.subtitle}>
              Enter your details. We will send a 6-digit code to your email.
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

              <label className={styles.label}>Email</label>
              <input
                className={styles.input}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
              />

              <label className={styles.label}>Phone (optional)</label>
              <input
                className={styles.input}
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="10-digit number"
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn} disabled={loading}>
                {loading ? "Sending OTP…" : "Send OTP"}
              </button>
            </form>
          </>
        )}

        {/* STEP 2: OTP */}
        {step === "otp" && (
          <>
            <h1 className={styles.title}>Enter OTP</h1>
            <p className={styles.subtitle}>
              We sent a 6-digit code to <strong>{email}</strong>
            </p>

            <form onSubmit={handleOtpSubmit} className={styles.form}>
              <label className={styles.label}>6-digit OTP</label>
              <input
                className={styles.input}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter OTP"
                required
              />

              {error && <p className={styles.error}>{error}</p>}

              <button type="submit" className={styles.primaryBtn}>
                Verify OTP
              </button>
            </form>
          </>
        )}

        {/* STEP 3: Parent */}
        {step === "parent" && (
          <>
            <h1 className={styles.title}>Parent Email Required</h1>
            <p className={styles.subtitle}>
              You are under 18. Please provide a parent’s email.
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

        {/* STEP 4: Password */}
        {step === "credentials" && (
          <>
            <h1 className={styles.title}>Create Password</h1>
            <p className={styles.subtitle}>
              Your email is verified. Now set your password.
            </p>

            <div className={styles.verifiedBox}>
              <p><strong>Name:</strong> {name}</p>
              <p><strong>Email:</strong> {email} ✓</p>
              <p><strong>Age:</strong> {age} years</p>
            </div>

            <form onSubmit={handleCreateAccount} className={styles.form}>
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
            <p className={styles.subtitle}>
              Your verified account is ready.
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