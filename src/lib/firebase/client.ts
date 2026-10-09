"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export function getFirebaseAuth() {
  const missing = [
    ["NEXT_PUBLIC_FIREBASE_API_KEY", config.apiKey],
    ["NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN", config.authDomain],
    ["NEXT_PUBLIC_FIREBASE_PROJECT_ID", config.projectId],
    ["NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET", config.storageBucket],
    ["NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", config.messagingSenderId],
    ["NEXT_PUBLIC_FIREBASE_APP_ID", config.appId],
  ].filter(([, value]) => !value).map(([name]) => name);
  if (missing.length) throw new Error(`متغيرات Firebase الناقصة: ${missing.join(", ")}`);
  const app = getApps().length ? getApp() : initializeApp(config);
  return getAuth(app);
}
