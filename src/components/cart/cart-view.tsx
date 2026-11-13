"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/cart-provider";
import { PriceSummary } from "@/components/cart/price-summary";
import { EmptyState } from "@/components/empty-state";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatMoney } from "@/lib/format";
import { useQuote } from "@/lib/use-quote";

function Stepper({
  label,
  qty,
  onChange,
}: {
  label: string;
  qty: number;
  onChange: (qty: number) => void;
}) {
  return (
    <div className="flex items-center overflow-hidden rounded-lg border border-primary font-bold text-primary">
      <button
        className="px-3 py-1"
        aria-label={`Decrease ${label} quantity`}
        onClick={() => onChange(qty - 1)}
      >
        −
      </button>
      <span className="px-2">{qty}</span>
      <button
        className="px-3 py-1"
        aria-label={`Increase ${label} quantity`}
        onClick={() => onChange(qty + 1)}
      >
        +
      </button>
    </div>
  );
}

export function CartView() {
  const { cart, setQty, remove, clear } = useCart();
  const { quote, error, loading } = useQuote(cart);

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
  if (error) {
    return (
      <div className="mx-auto max-w-[760px]">
        <EmptyState tone="error">
          {error.status === 404
            ? "This restaurant is no longer available."
            : "Couldn't price your cart. Please try again."}
          <div className="mt-3">
            <Button size="sm" onClick={clear}>
              Clear cart
            </Button>
          </div>
        </EmptyState>
      </div>
    );
  }
  if (!quote) return <Skeleton className="mx-auto h-64 max-w-[760px]" />;

  const lineById = new Map(quote.lines.map((l) => [l.itemId, l]));
  const problems = new Map(
    quote.issues.flatMap((i) => ("itemId" in i ? [[i.itemId, i] as const] : [])),
  );
  const closed = quote.issues.some((i) => i.code === "restaurant_closed");
  const blocked = quote.issues.length > 0;

  return (
    <div className="mx-auto flex max-w-[760px] flex-col gap-4">
      <h1 className="text-2xl font-semibold">Your cart</h1>
      <Card>
        <CardContent className="flex flex-col gap-2">
          <h2 className="font-semibold">{quote.restaurant.name}</h2>
          {closed && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm">
              This restaurant is closed right now, so you can&apos;t place this order yet.
            </p>
          )}
          {cart.lines.map((l) => {
            const line = lineById.get(l.itemId);
            const problem = problems.get(l.itemId);
            return (
              <div key={l.itemId} className="flex items-center justify-between gap-3 border-t py-3">
                <div className={problem ? "opacity-60" : ""}>
                  <div className="font-medium">
                    {line?.name ??
                      (problem && "name" in problem ? problem.name : "Item no longer available")}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {line ? `${formatMoney(line.unitPricePaise)} each` : null}
                    {problem?.code === "item_unavailable" && "Currently unavailable"}
                    {problem?.code === "item_not_found" && "Removed from the menu"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Stepper
                    label={line?.name ?? "item"}
                    qty={l.qty}
                    onChange={(q) => setQty(l.itemId, q)}
                  />
                  <span className="w-20 text-right">
                    {line ? formatMoney(line.linePaise) : "—"}
                  </span>
                  <Button size="sm" variant="ghost" onClick={() => remove(l.itemId)}>
                    Remove
                  </Button>
                </div>
              </div>
            );
          })}
          {quote.issues.some((i) => "itemId" in i) && (
            <p className="text-sm text-destructive">
              Some items are unavailable. Remove them to continue.
            </p>
          )}
          <div className={`border-t pt-3 ${loading ? "opacity-60" : ""}`}>
            <PriceSummary price={quote} />
          </div>
        </CardContent>
      </Card>
      <div className="flex justify-between">
        <Button variant="outline" onClick={clear}>
          Clear cart
        </Button>
        <Link
          href="/checkout"
          aria-disabled={blocked}
          className={buttonVariants() + (blocked ? " pointer-events-none opacity-50" : "")}
        >
          Proceed to checkout
        </Link>
      </div>
    </div>
  );
}
