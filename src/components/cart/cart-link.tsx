"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";

/** Header link showing the number of items in the cart. */
export function CartLink() {
  const { count } = useCart();
  return (
    <Link href="/cart" className="hover:text-primary">
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
