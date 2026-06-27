import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Adviser AI — Elite Strategic Intelligence Platform",
  description:
    "World-class strategic advisory powered by multi-agent AI. Get McKinsey-grade insights, market research, business validation, and expert strategy in minutes.",
  keywords:
    "AI strategy, business consulting, market research, startup advisor, strategic intelligence",
  openGraph: {
    title: "Adviser AI — Elite Strategic Intelligence Platform",
    description: "Democratizing world-class strategic advisory with AI",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
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
      <body>{children}</body>
    </html>
  );
}
