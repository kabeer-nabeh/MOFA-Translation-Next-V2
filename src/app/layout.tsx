import type { Metadata } from "next";
import { IBM_Plex_Sans } from "next/font/google";

import "./globals.css";
import { ActiveMeetingProvider } from "@/contexts/ActiveMeetingContext";

const ibmPlexSans = IBM_Plex_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-ibm-plex-sans",
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
    <html lang="en" className={ibmPlexSans.variable}>
      <body
        className={`${ibmPlexSans.className} min-h-dvh bg-white font-sans text-slate-900 antialiased`}
      >
        <ActiveMeetingProvider>
          {children}
        </ActiveMeetingProvider>
      </body>
    </html>
  );
}

