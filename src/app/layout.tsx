import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartLink } from "@/components/cart/cart-link";
import { SiteHeader } from "@/components/site-header";
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
  title: "Dabba",
  description: "Order food from restaurants near you.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col">
        <CartProvider>
          <SiteHeader>
            <CartLink />
            <Suspense>
              <SiteNav />
            </Suspense>
          </SiteHeader>
          <main className="mx-auto w-full max-w-[1100px] flex-1 px-4 py-5">{children}</main>
          <Toaster richColors position="top-center" />
        </CartProvider>
      </body>
    </html>
  );
}
