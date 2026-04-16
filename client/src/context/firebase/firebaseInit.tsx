"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY_FIREBASE,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN_FIREBASE,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID_FIREBASE,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_FIREBASE,
  messagingSenderId: process.env.NEXT_PUBLIC_SENDER_ID_FIREBASE,
  appId: process.env.NEXT_PUBLIC_APP_ID_FIREBASE,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID_FIREBASE,
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch((err) => {
    console.error("Firebase persistence error:", err);
  });
  auth.useDeviceLanguage();
}

const db = getFirestore(app);

export { auth, db };
