import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "عروض زيزي",
  description: "عروض زيزي للاختبارات والجلسات والكوتشينغ والدورات.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ar" dir="rtl" className="h-full antialiased">
      <body className="min-h-full">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
