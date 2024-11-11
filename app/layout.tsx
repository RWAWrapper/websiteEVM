import type { Metadata } from "next";
import { Providers } from "./provider";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "RWAWrapper",
  description: "RWAWrapper is a Real World Assets Wrapper on Starknet, which allows you to wrap your Real World Assets (RWA) into NFTs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex justify-end p-4 absolute z-10 right-0">
            <ConnectButton />
          </div>
          {children}
        </Providers>
      </body>
    </html>
  );
}
