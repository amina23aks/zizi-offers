import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "الكوتشينغ | عروض زيزي",
};

export default function CoachingPage() {
  return <CategoryPage category="coaching" />;
}
