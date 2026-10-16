import type { Metadata } from "next";
import { Inter } from "next/font/google";
import FounderFab from "@/components/layout/FounderFab";
import JsonLd from "@/components/JsonLd";
import "@/styles/globals.scss";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Eqonomy | Opportunities, Internships & Guidance in Delhi-NCR",
  description:
    "A hyper-local proof-of-work and micro-project marketplace connecting students and freelancers with verified startup tasks in Delhi-NCR.",
  verification: {
    google: "_KZ7B38UF0svDckvuof9fhQPc_JxjnOUbYBJ7gi1ELY",
  },
  metadataBase: new URL("https://eqonomy.vercel.app"),
  alternates: {
    canonical: "https://eqonomy.vercel.app",
  },
  openGraph: {
    title: "Eqonomy | Opportunities in Delhi-NCR",
    description:
      "Find paid projects, internships, challenges and guidance sessions from real local providers.",
    url: "https://eqonomy.vercel.app",
    siteName: "Eqonomy",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "Eqonomy | Opportunities in Delhi-NCR",
    description:
      "Find paid projects, internships and guidance sessions in Delhi-NCR.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.png",
    apple: "/favicon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <JsonLd />
      </head>
      <body>
        {children}
        <FounderFab />
      </body>
    </html>
  );
}