import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";
import CookieBanner from "@/components/ui/CookieBanner";

export const metadata: Metadata = {
  metadataBase: new URL("https://adviserai.com"),
  title: "Adviser AI — Elite Strategic Intelligence Platform",
  description:
    "World-class strategic advisory powered by multi-agent AI. Get McKinsey-grade insights, market research, business validation, and expert strategy in minutes.",
  keywords:
    "AI strategy, business consulting, market research, startup advisor, strategic intelligence, SWOT analysis, market analysis",
  alternates: {
    canonical: "https://adviserai.com",
  },
  openGraph: {
    title: "Adviser AI — Elite Strategic Intelligence Platform",
    description: "Democratizing world-class strategic advisory with AI. McKinsey-grade insights in minutes.",
    type: "website",
    url: "https://adviserai.com",
    siteName: "Adviser AI",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Adviser AI — Elite Strategic Intelligence Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Adviser AI — Elite Strategic Intelligence Platform",
    description: "Democratizing world-class strategic advisory with AI",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
