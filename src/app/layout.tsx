import type { Metadata } from "next";
import { Inter } from "next/font/google";
import FounderFab from "@/components/layout/FounderFab";
import "@/styles/globals.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eqonomy — Want to do It?",
  description:
    "Airbnb-inspired opportunity marketplace. Delhi-first. Hosts-first.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {children}
        <FounderFab />
      </body>
    </html>
  );
}
