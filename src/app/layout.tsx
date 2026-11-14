import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartBar } from "@/components/cart/cart-bar";
import { CartLink } from "@/components/cart/cart-link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SiteNav } from "@/components/site-nav";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Foodzie",
  description: "Order food from restaurants near you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:m-2 focus:rounded-md focus:bg-white focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <CartProvider>
          <SiteHeader>
            <CartLink />
            <Suspense>
              <SiteNav />
            </Suspense>
          </SiteHeader>
          <main
            id="main"
            className="animate-fade-up mx-auto w-full max-w-[1100px] flex-1 px-4 py-5"
          >
            {children}
          </main>
          <SiteFooter />
          <CartBar />
          <Toaster richColors position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
