import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import "./globals.css";

const moderat = localFont({
  src: "../../public/brand/Fonts/moderat-bold.ttf",
  variable: "--font-dogwood-sans",
  display: "swap"
});

const tiller = localFont({
  src: "../../public/brand/Fonts/Tiller-Heavy.otf",
  variable: "--font-dogwood-display",
  display: "swap"
});

export const metadata: Metadata = {
  title: "Dogwood Player Portal",
  description: "Player development portal for Dogwood Golf & Social"
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html className={`${moderat.variable} ${tiller.variable}`} lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
