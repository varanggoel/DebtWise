import type { Metadata } from "next";

import Providers from "@/components/Providers";

import "./globals.css";

export const metadata: Metadata = {
  title: "DebtWise",
  description:
    "Track your debts, simulate Snowball vs Avalanche payoff strategies, and analyze financial documents with AI.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
