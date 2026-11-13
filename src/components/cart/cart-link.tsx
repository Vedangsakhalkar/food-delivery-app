"use client";

import { ShoppingBag } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";

/** Header cart button with an item-count badge that pops when the count changes. */
export function CartLink() {
  const { count } = useCart();
  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart (${count})` : "Cart"}
      className="relative flex items-center gap-1.5 rounded-full px-3 py-2 hover:bg-muted hover:text-primary"
    >
      <ShoppingBag className="size-5" aria-hidden />
      <span className="hidden sm:inline">Cart</span>
      {count > 0 && (
        <span
          key={count}
          aria-hidden
          className="absolute -top-0.5 -right-0.5 grid min-w-5 animate-in place-items-center rounded-full bg-primary px-1 text-[11px] leading-5 font-bold text-primary-foreground zoom-in-50 duration-200 sm:static sm:ml-0.5"
        >
          {count}
        </span>
      )}
    </Link>
  );
}
