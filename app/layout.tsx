import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "REMi | Tonight, understood",
  description:
    "A cycle-aware sleep guide that turns body signals into bedtime actions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
