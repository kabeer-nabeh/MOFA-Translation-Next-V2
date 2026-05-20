import type { Metadata } from "next";
import { Stack_Sans_Text, IBM_Plex_Sans_Arabic } from "next/font/google";

import "./globals.css";
import { ActiveMeetingProvider } from "@/contexts/ActiveMeetingContext";

const stackSansText = Stack_Sans_Text({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-stack-sans-text",
});

const ibmPlexSansArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans-arabic",
});

export const metadata: Metadata = {
  title: "MOFA Translation",
  description: "MOFA Translation Next.js app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${stackSansText.variable} ${ibmPlexSansArabic.variable}`}>
      <body
        className={`${stackSansText.className} min-h-dvh bg-[color:var(--mofa-page-bg)] font-sans text-[color:var(--mofa-text-primary)] antialiased`}
      >
        <ActiveMeetingProvider>
          {children}
        </ActiveMeetingProvider>
      </body>
    </html>
  );
}

