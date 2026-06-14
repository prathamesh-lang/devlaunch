import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "DevLaunch — AI Project Scaffold Generator",
  description: "Stop wasting hours on project setup. Type your stack, get production-ready code instantly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable} style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}