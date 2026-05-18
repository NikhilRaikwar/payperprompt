import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Web3Provider } from "@/components/Web3Provider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PayPerPrompt — Stripe for AI Agents",
  description: "Autonomous gasless stablecoin micropayments for AI Agents executing on the Kite Chain. Built with Kite Passport and EIP-3009.",
  keywords: [
    "Kite AI",
    "Stripe for AI Agents",
    "Agentic Web3",
    "EIP-3009",
    "PYUSD",
    "Gasless micropayments",
    "Account Abstraction",
    "AI Agent Economy",
    "Kite Chain Testnet"
  ],
  authors: [{ name: "Nikhil Raikwar" }],
  openGraph: {
    title: "PayPerPrompt — Stripe for AI Agents",
    description: "Autonomous gasless stablecoin micropayments for AI Agents executing on the Kite Chain. Built with Kite Passport and EIP-3009.",
    url: "https://payperprompt.nikhilraikwar.me",
    siteName: "PayPerPrompt",
    images: [
      {
        url: "https://payperprompt.nikhilraikwar.me/banner.png",
        width: 1200,
        height: 630,
        alt: "PayPerPrompt — Stripe for AI Agents",
      }
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PayPerPrompt — Stripe for AI Agents",
    description: "Autonomous gasless stablecoin micropayments for AI Agents executing on the Kite Chain. Built with Kite Passport and EIP-3009.",
    images: ["https://payperprompt.nikhilraikwar.me/banner.png"],
  },
  metadataBase: new URL("https://payperprompt.nikhilraikwar.me"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Web3Provider>
          {children}
          <Analytics />
        </Web3Provider>
      </body>
    </html>
  );
}
