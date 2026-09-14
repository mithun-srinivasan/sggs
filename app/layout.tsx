import type { Metadata } from "next";
import { Noto_Sans_Gurmukhi, Inter } from "next/font/google";
import { ReaderPrefsProvider } from "@/components/ReaderPrefsProvider";
import { BookmarksProvider } from "@/components/BookmarksProvider";
import PageTransition from "@/components/PageTransition";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const gurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  weight: ["400", "500", "600"],
  variable: "--font-gurmukhi",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sri Guru Granth Sahib Ji — Ang Reader",
  description: "A radically minimalist, verse-by-verse digital reader for Sri Guru Granth Sahib Ji.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="theme-light" suppressHydrationWarning>
      <body className={`${gurmukhi.variable} ${inter.variable} font-sans antialiased`}>
        <div className="page-crossfade-overlay" id="crossfade-overlay" />
        <ReaderPrefsProvider>
          <BookmarksProvider>
            <PageTransition />
            {children}
          </BookmarksProvider>
        </ReaderPrefsProvider>
        <Analytics />
      </body>
    </html>
  );
}
