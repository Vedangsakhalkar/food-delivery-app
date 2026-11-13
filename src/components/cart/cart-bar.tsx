"use client";

import { ChevronRight, ShoppingBag } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/components/cart/cart-provider";

/** Floating "View cart" bar shown at the bottom while the cart has items (hidden on cart/checkout). */
export function CartBar() {
  const { count } = useCart();
  const pathname = usePathname();
  if (count === 0 || pathname.startsWith("/cart") || pathname.startsWith("/checkout")) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-4 pt-8 [padding-bottom:max(1rem,env(safe-area-inset-bottom))]">
      <Link
        href="/cart"
        className="pointer-events-auto flex w-full max-w-md animate-in items-center justify-between gap-3 rounded-2xl bg-primary px-5 py-3.5 font-semibold text-primary-foreground shadow-lg shadow-primary/30 transition hover:brightness-110 slide-in-from-bottom-4 duration-300"
      >
        <span className="flex items-center gap-2">
          <ShoppingBag className="size-5" aria-hidden />
          {count} {count === 1 ? "item" : "items"} in your cart
        </span>
        <span className="flex items-center gap-1">
          View cart <ChevronRight className="size-5" aria-hidden />
        </span>
      </Link>
    </div>
  );
}
