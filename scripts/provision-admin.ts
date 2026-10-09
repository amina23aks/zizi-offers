import { cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

async function main() {
const targetUid = "Qhmsmesd3jNE32F5SDU52u5IGRt2";
const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const rawKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY;
const missing = [["FIREBASE_ADMIN_PROJECT_ID", projectId], ["FIREBASE_ADMIN_CLIENT_EMAIL", clientEmail], ["FIREBASE_ADMIN_PRIVATE_KEY", rawKey]].filter(([, value]) => !value).map(([name]) => name);
if (missing.length) throw new Error(`Missing environment variables: ${missing.join(", ")}`);
if (projectId !== "zizi-offers") throw new Error("Refusing to provision: FIREBASE_ADMIN_PROJECT_ID must be zizi-offers");
const privateKey = rawKey!.replace(/\\n/g, "\n");
if (!privateKey.includes("BEGIN PRIVATE KEY")) throw new Error("Malformed environment variable: FIREBASE_ADMIN_PRIVATE_KEY");

const auth = getAuth(initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) }));
const user = await auth.getUser(targetUid); // authenticated operation proves the UID exists in this project
console.log(`UID ${targetUid} exists; current admin claim: ${user.customClaims?.admin === true}.`);
await auth.setCustomUserClaims(targetUid, { ...user.customClaims, admin: true });
const verified = await auth.getUser(targetUid);
if (verified.customClaims?.admin !== true) throw new Error("Admin claim verification failed");
console.log(`Granted and verified admin:true for UID ${targetUid}. The user must sign in again or force-refresh their ID token.`);
}

main().catch((error: unknown) => { console.error(error instanceof Error ? error.message : "Provisioning failed"); process.exitCode = 1; });
