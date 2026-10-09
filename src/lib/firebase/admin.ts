import "server-only";

import { cert, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const required = [
  "FIREBASE_ADMIN_PROJECT_ID",
  "FIREBASE_ADMIN_CLIENT_EMAIL",
  "FIREBASE_ADMIN_PRIVATE_KEY",
] as const;

export function getFirebaseAdmin() {
  const missing = required.filter((name) => !process.env[name]);
  if (missing.length) throw new Error(`Missing server configuration: ${missing.join(", ")}`);
  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID!;
  if (projectId !== "zizi-offers") throw new Error("Invalid server configuration: FIREBASE_ADMIN_PROJECT_ID");
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(/\\n/g, "\n");
  if (!privateKey.includes("BEGIN PRIVATE KEY") || !privateKey.includes("END PRIVATE KEY")) {
    throw new Error("Malformed server configuration: FIREBASE_ADMIN_PRIVATE_KEY");
  }
  const app = getApps().length
    ? getApp()
    : initializeApp({ credential: cert({ projectId, clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!, privateKey }) });
  return { auth: getAuth(app), db: getFirestore(app), projectId };
}
