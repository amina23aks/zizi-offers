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
