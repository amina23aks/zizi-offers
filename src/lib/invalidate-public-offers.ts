import "server-only";
import { revalidatePath } from "next/cache";

export function invalidatePublicOffers() {
  for (const path of ["/", "/coaching", "/courses", "/programs", "/sessions", "/tests", "/compass", "/offers/emotional-communication"]) revalidatePath(path);
}
