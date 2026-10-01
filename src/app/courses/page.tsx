import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "الدورات | عروض زيزي",
};

export default function CoursesPage() {
  return <CategoryPage category="courses" />;
}
