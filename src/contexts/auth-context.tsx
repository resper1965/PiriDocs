"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User,
  signInWithPopup,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { auth, googleProvider, db } from "@/lib/firebase/config";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

// User profile interface
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: "broker" | "admin";
  createdAt: Date;
  lastLogin: Date;
}

// Auth context interface
interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserCredential | null>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

// Auth Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Create or update user profile in Firestore
  const createUserProfile = async (user: User) => {
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      // Update last login
      const updateData = {
        lastLogin: serverTimestamp(),
      };
      await setDoc(userRef, updateData, { merge: true });
      return userSnap.data() as UserProfile;
    } else {
      // Create new user profile
      const newProfile: Omit<UserProfile, "createdAt" | "lastLogin"> & {
        createdAt: ReturnType<typeof serverTimestamp>;
        lastLogin: ReturnType<typeof serverTimestamp>;
      } = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: "broker",
        createdAt: serverTimestamp(),
        lastLogin: serverTimestamp(),
      };
      await setDoc(userRef, newProfile);
      return {
        ...newProfile,
        createdAt: new Date(),
        lastLogin: new Date(),
      } as UserProfile;
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const profile = await createUserProfile(result.user);
      setUserProfile(profile);
      return result;
    } catch (error) {
      console.error("Error signing in with Google:", error);
      return null;
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const profile = await createUserProfile(user);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    userProfile,
    loading,
    signInWithGoogle,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
