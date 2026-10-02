import type { Metadata } from "next";
import { CategoryPage } from "@/components/category-page";

export const metadata: Metadata = {
  title: "الكوتشينغ | عروض زيزي",
};

type CoachingPageProps = {
  searchParams?: Promise<{
    format?: string;
  }>;
};

export default async function CoachingPage({ searchParams }: CoachingPageProps) {
  const params = await searchParams;
  const format = params?.format === "group" || params?.format === "individual" ? params.format : null;

  return <CategoryPage category="coaching" coachingFormat={format} />;
}
