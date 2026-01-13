import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Nav/Navbar";
import BottomNav from "@/components/Nav/BottomNav";
import { Toaster } from "react-hot-toast";
import Footer from "@/components/Footer";
import PolapainAuthProvider from "@/provider/PolapainProvider";

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
  title: "Control Room",
  description: "Control Room",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <PolapainAuthProvider>
          <Navbar>
            <main className="min-h-[calc(100vh-296px)] flex flex-col justify-center items-center">
              {children}
            </main>
            <Footer />
          </Navbar>
          <BottomNav />
          <Toaster position="top-right" reverseOrder={false} />
        </PolapainAuthProvider>
      </body>
    </html>
  );
}
