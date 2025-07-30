import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { browserLocalPersistence } from "firebase/auth";

// Configuración de Firebase

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_API_KEY_FIREBASE,
  authDomain: process.env.NEXT_PUBLIC_AUTH_DOMAIN_FIREBASE,
  projectId: process.env.NEXT_PUBLIC_PROJECT_ID_FIREBASE,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_FIREBASE,
  messagingSenderId: process.env.NEXT_PUBLIC_SENDER_ID_FIREBASE,
  appId: process.env.NEXT_PUBLIC_APP_ID_FIREBASE,
  measurementId: process.env.NEXT_PUBLIC_MEASUREMENT_ID_FIREBASE,
};

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
/*const firebaseConfig = {
  apiKey: "AIzaSyDFvPIl5-Ry_b4MeAURHADmFRTSzZYdHF8",
  authDomain: "e-commerce-web-681dc.firebaseapp.com",
  projectId: "e-commerce-web-681dc",
  storageBucket: "e-commerce-web-681dc.appspot.com",
  messagingSenderId: "834902306683",
  appId: "1:834902306683:web:e82a70433c5fb4ee4f97de",
  measurementId: "G-C8E52M4FPS",
};*/

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
auth.setPersistence(browserLocalPersistence);
auth.useDeviceLanguage();

const db = getFirestore(app);

export { auth, db };
