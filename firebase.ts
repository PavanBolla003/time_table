
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC6bENToWyNu-Qc-IEyiHsIi19TpX5I3RI",
  authDomain: "timetable-a3246.firebaseapp.com",
  projectId: "timetable-a3246",
  storageBucket: "timetable-a3246.firebasestorage.app",
  messagingSenderId: "439858035784",
  appId: "1:439858035784:web:bbbff2e559861e3e4cec7d",
  measurementId: "G-F7N8ETE343"
};

export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
