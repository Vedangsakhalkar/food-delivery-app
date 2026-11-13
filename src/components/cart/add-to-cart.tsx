"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { useCart } from "@/components/cart/cart-provider";
import { Button } from "@/components/ui/button";
import { useCurrentUser } from "@/lib/use-current-user";

/** ADD button that turns into a quantity stepper once the item is in the cart (mock C3). */
export function AddToCart({
  restaurantId,
  itemId,
  disabled,
  label = "ADD",
}: {
  restaurantId: string;
  itemId: string;
  disabled: boolean;
  label?: string;
}) {
  const router = useRouter();
  const user = useCurrentUser();
  const cart = useCart();
  const [confirmReplace, setConfirmReplace] = useState(false);
  const qty =
    cart.cart.restaurantId === restaurantId
      ? (cart.cart.lines.find((l) => l.itemId === itemId)?.qty ?? 0)
      : 0;

  function add() {
    if (user === undefined) return;
    if (user === null) {
      toast.info("Please log in to add items to your cart");
      router.push(`/login?next=${encodeURIComponent(`/restaurants/${restaurantId}`)}`);
      return;
    }
    if (user.role !== "customer") {
      toast.error("Only customer accounts can place orders");
      return;
    }
    if (cart.conflictsWith(restaurantId)) {
      setConfirmReplace(true);
      return;
    }
    cart.add(restaurantId, itemId);
  }

  if (qty > 0) {
    return (
      <div className="flex items-center overflow-hidden rounded-lg border border-primary font-bold text-primary">
        <button
          className="px-3 py-1"
          aria-label="Decrease quantity"
          onClick={() => cart.setQty(itemId, qty - 1)}
        >
          −
        </button>
        <span className="px-2" aria-live="polite">
          {qty}
        </span>
        <button
          className="px-3 py-1"
          aria-label="Increase quantity"
          onClick={() => cart.setQty(itemId, qty + 1)}
        >
          +
        </button>
      </div>
    );
  }
  return (
    <>
      <Button size="sm" variant="outline" disabled={disabled} onClick={add}>
        {label}
      </Button>
      <ConfirmDialog
        open={confirmReplace}
        onOpenChange={setConfirmReplace}
        title="Replace cart items?"
        description="Your cart has items from another restaurant. Replace them with this restaurant's items?"
        confirmLabel="Replace"
        onConfirm={() => cart.replaceWith(restaurantId, itemId)}
      />
    </>
  );
}
