"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useApi } from "@/lib/use-api";
import type { PublicMenuItem, RestaurantWithMenu } from "@/models/public-restaurant";

export function CartView() {
  const { cart, setQty, remove, clear } = useCart();
  const { data, error, loading } = useApi<RestaurantWithMenu>(
    cart.restaurantId ? `/api/restaurants/${cart.restaurantId}` : null,
  );

  if (!cart.restaurantId || cart.lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-[760px] flex-col gap-4">
        <h1 className="text-2xl font-semibold">Your cart</h1>
        <EmptyState>
          Your cart is empty.
          <div className="mt-3">
            <Link href="/" className={buttonVariants({ size: "sm" })}>
              Browse restaurants
            </Link>
          </div>
        </EmptyState>
      </div>
    );
  }
  if (loading) return <Skeleton className="mx-auto h-64 max-w-[760px]" />;
  if (error || !data) {
    return (
      <div className="mx-auto max-w-[760px]">
        <EmptyState tone="error">
          This restaurant is no longer available.
          <div className="mt-3">
            <Button size="sm" onClick={clear}>
              Clear cart
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const menu = new Map<string, PublicMenuItem>(
    data.categories.flatMap((c) => c.items).map((i) => [i.id, i]),
  );
  const rows = cart.lines.map((l) => ({ line: l, item: menu.get(l.itemId) }));
  const subtotal = rows.reduce((sum, r) => sum + (r.item ? r.item.pricePaise * r.line.qty : 0), 0);
  const unavailable = rows.filter((r) => !r.item || !r.item.isAvailable);

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <h2 className="font-semibold">{data.restaurant.name}</h2>
          {rows.map(({ line, item }) => (
            <div
              key={line.itemId}
              className="flex items-center justify-between gap-3 border-t py-3"
            >
              <div className={item?.isAvailable ? "" : "opacity-50"}>
                <div className="font-medium">{item?.name ?? "Item no longer available"}</div>
                {item && (
                  <div className="text-sm text-muted-foreground">
                    {formatMoney(item.pricePaise)} each
                    {!item.isAvailable && " · Unavailable"}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center overflow-hidden rounded-lg border border-primary font-bold text-primary">
                  <button
                    className="px-3 py-1"
                    aria-label={`Decrease ${item?.name ?? "item"} quantity`}
                    onClick={() => setQty(line.itemId, line.qty - 1)}
                  >
                    −
                  </button>
                  <span className="px-2">{line.qty}</span>
                  <button
                    className="px-3 py-1"
                    aria-label={`Increase ${item?.name ?? "item"} quantity`}
                    onClick={() => setQty(line.itemId, line.qty + 1)}
                  >
                    +
                  </button>
                </div>
                <span className="w-20 text-right">
                  {item ? formatMoney(item.pricePaise * line.qty) : "—"}
                </span>
                <Button size="sm" variant="ghost" onClick={() => remove(line.itemId)}>
                  Remove
                </Button>
              </div>
            </div>
          ))}
          {unavailable.length > 0 && (
            <p className="text-sm text-destructive">
              Some items are unavailable. Remove them to continue.
            </p>
          )}
          <div className="flex items-center justify-between border-t pt-3 font-semibold">
            <span>Subtotal</span>
            <span>{formatMoney(subtotal)}</span>
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={clear}>
          Clear cart
        </Button>
        <Link
          href="/checkout"
          aria-disabled={unavailable.length > 0}
          className={
            buttonVariants() + (unavailable.length > 0 ? " pointer-events-none opacity-50" : "")
          }
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
