import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "البرمجات | عروض زيزي",
};

export default function ProgramsPage() {
  return <CategoryPage category="programs" />;
}
