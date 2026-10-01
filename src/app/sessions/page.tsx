import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "الجلسات والاستشارات | عروض زيزي",
};

export default function SessionsPage() {
  return <CategoryPage category="sessions" />;
}
