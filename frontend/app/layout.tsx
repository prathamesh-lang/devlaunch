import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLaunch — AI Project Scaffold Generator",
  description: "Stop wasting hours on setup. Start building instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}