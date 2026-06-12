import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevLaunch",
  description: "Generate project scaffolds instantly",
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