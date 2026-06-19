"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const configuredFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY_FIREBASE,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN_FIREBASE,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID_FIREBASE,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_FIREBASE,
  messagingSenderId: process.env.NEXT_PUBLIC_SENDER_ID_FIREBASE,
  appId: process.env.NEXT_PUBLIC_APP_ID_FIREBASE,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID_FIREBASE,
};

const fallbackFirebaseConfig = {
  apiKey: "AIzaSyDummyFirebaseApiKeyForLocalBuild",
  authDomain: "ecommerce-demo-local.invalid",
  projectId: "ecommerce-demo-local",
  storageBucket: "ecommerce-demo-local.appspot.com",
  messagingSenderId: "000000000000",
  appId: "1:000000000000:web:0000000000000000000000",
  measurementId: "G-0000000000",
};

const hasFirebaseConfig = Object.values(configuredFirebaseConfig).every(
  (value) => value && value.trim().length > 0
);

// Next prerenders client components during build; use an inert config if local
// Firebase env vars are absent so validation does not require secrets.
const firebaseConfig = hasFirebaseConfig
  ? configuredFirebaseConfig
  : fallbackFirebaseConfig;

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);

if (typeof window !== "undefined") {
  setPersistence(auth, browserLocalPersistence).catch(() => undefined);
  auth.useDeviceLanguage();
}

const db = getFirestore(app);

export { auth, db };
