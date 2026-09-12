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
  description: "Opportunity marketplace for Delhi-NCR",
  verification: {
    google: "_KZ7B38UF0svDckvuof9fhQPc_JxjnOUbYBJ7gi1ELY",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.png",          
    apple: "/favicon.png",
  },
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
