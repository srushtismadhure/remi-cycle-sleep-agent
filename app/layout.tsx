import type { Metadata } from "next";

import { SpotProvider } from "@/components/SpotProvider";

import "./globals.css";

export const metadata: Metadata = {
  title: "REMi | Rhythm. Rest.",
  description:
    "Sleep support designed for women's biology. REMi interprets hormonal rhythms, recovery signals, and cycle patterns to personalize how you wind down each night.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SpotProvider>{children}</SpotProvider>
      </body>
    </html>
  );
}
