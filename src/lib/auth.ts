import { auth, db } from "./firebase";
import {
  onAuthStateChanged,
  User,
  signOut as firebaseSignOut,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { UserProfile } from "@/types";

// Listen to auth state changes
export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// Sign out
export async function signOut() {
  await firebaseSignOut(auth);
}

// Create or get user profile from Firestore
export async function ensureUserProfile(user: User): Promise<UserProfile> {
  const userRef = doc(db, "users", user.uid);
  const snap = await getDoc(userRef);

  if (snap.exists()) {
    return snap.data() as UserProfile;
  }

  // First time login → create profile
  const newProfile: UserProfile = {
  uid: user.uid,
  email: user.email || "",
  role: "seeker",
  displayName: user.email?.split("@")[0] || "User",
  skills: [],
  isMinor: false,
  verificationStatus: "unverified",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  completedOpportunitiesCount: 0,
  reputationScore: 50,
  walletBalance: 0, // ← new field
};

  await setDoc(userRef, {
    ...newProfile,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return newProfile;
}