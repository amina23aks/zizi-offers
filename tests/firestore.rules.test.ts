import { readFileSync } from "node:fs";
import "firebase/compat/firestore";
import { assertFails, assertSucceeds, initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, Timestamp } from "firebase/firestore";
import { afterAll, beforeAll, describe, it } from "vitest";

let env: RulesTestEnvironment;
const valid = (status: "draft" | "published") => ({ id: `${status}-offer`, title: "عرض", category: "coaching", description: "", topics: [], image: { kind: "none", alt: "" }, variants: [{ id: "individual", title: "فردي", price: { amountUsd: null, status: "unknown" }, availability: "unknown" }], duration: "", sessionDuration: "", capacity: "", displayOrder: 1, status, createdAt: Timestamp.now(), updatedAt: Timestamp.now() });

beforeAll(async () => {
  env = await initializeTestEnvironment({ projectId: "zizi-offers-test", firestore: { rules: readFileSync("firestore.rules", "utf8"), host: "127.0.0.1", port: 8080 } });
  await env.withSecurityRulesDisabled(async (context) => { await setDoc(doc(context.firestore(), "offers/published-offer"), valid("published")); await setDoc(doc(context.firestore(), "offers/draft-offer"), valid("draft")); });
});
afterAll(async () => env?.cleanup());

describe("Firestore offer authorization", () => {
  it("denies unauthenticated writes", async () => assertFails(setDoc(doc(env.unauthenticatedContext().firestore(), "offers/new-offer"), { ...valid("draft"), id: "new-offer" })));
  it("denies authenticated non-admin writes", async () => assertFails(setDoc(doc(env.authenticatedContext("member").firestore(), "offers/new-offer"), { ...valid("draft"), id: "new-offer" })));
  it("allows authorized admin writes", async () => assertSucceeds(setDoc(doc(env.authenticatedContext("admin", { admin: true }).firestore(), "offers/new-offer"), { ...valid("draft"), id: "new-offer" })));
  it("denies public draft reads", async () => assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "offers/draft-offer"))));
  it("allows public published reads", async () => assertSucceeds(getDoc(doc(env.unauthenticatedContext().firestore(), "offers/published-offer"))));
});

 describe("backward compatible offer data", () => {
  it("accepts a general free offer and retains independent publication state", async () => {
    const data = { ...valid("draft"), id: "general-offer", delivery: "general", variants: [{ id: "general", title: "السعر", price: { status: "free", amountUsd: 0 }, availability: "available" }] };
    await assertSucceeds(setDoc(doc(env.authenticatedContext("admin", { admin: true }).firestore(), "offers/general-offer"), data));
    await assertFails(getDoc(doc(env.unauthenticatedContext().firestore(), "offers/general-offer")));
  });
  it("reads four-package server records while retaining the direct-client write limit", async () => {
    const data = { ...valid("draft"), id: "package-offer", delivery: "both", variants: ["individual-one-month", "individual-two-months", "group-one-month", "group-two-months"].map((id) => ({ id, title: "باقة", price: { status: "known", amountUsd: 100 }, availability: id.startsWith("group") ? "unavailable" : "available", note: "الوصف المحفوظ" })) };
    await assertFails(setDoc(doc(env.authenticatedContext("admin", { admin: true }).firestore(), "offers/package-offer"), data));
    await env.withSecurityRulesDisabled(async (context) => setDoc(doc(context.firestore(), "offers/package-offer"), data));
    await assertSucceeds(getDoc(doc(env.authenticatedContext("admin", { admin: true }).firestore(), "offers/package-offer")));
  });
  it("rejects a malformed price even for an admin", async () => {
    await assertFails(setDoc(doc(env.authenticatedContext("admin", { admin: true }).firestore(), "offers/invalid-price"), { ...valid("draft"), id: "invalid-price", variants: [{ id: "individual", title: "فردي", price: { status: "unknown", amountUsd: 0 }, availability: "unknown" }] }));
  });
  it("denies a signed-in member access to drafts", async () => {
    await assertFails(getDoc(doc(env.authenticatedContext("member").firestore(), "offers/draft-offer")));
  });
});
