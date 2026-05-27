import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { Caveat } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["600", "700"],
});

export const metadata: Metadata = {
  title: "The Lenny Tank",
  description:
    "Practice the high-stakes decisions of your craft. Get feedback from people who've already lived them.",
  icons: {
    icon: "/favicon_fin.svg.jpg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geist.variable} ${caveat.variable} antialiased`} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
