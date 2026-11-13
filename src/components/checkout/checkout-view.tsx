"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { useCart } from "@/components/cart/cart-provider";
import { PriceSummary } from "@/components/cart/price-summary";
import { EmptyState } from "@/components/empty-state";
import { AddressDialog } from "@/components/profile/addresses-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError, apiFetch } from "@/lib/api-client";
import { useApi } from "@/lib/use-api";
import { useQuote } from "@/lib/use-quote";
import type { Address } from "@/models/address";

export function CheckoutView() {
  const router = useRouter();
  const { cart, clear } = useCart();
  const { quote, error } = useQuote(cart);
  const addresses = useApi<{ addresses: Address[] }>("/api/me/addresses");
  const [chosen, setChosen] = useState<string>();
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [placing, setPlacing] = useState(false);

  if (!cart.restaurantId || cart.lines.length === 0) {
    return (
      <EmptyState>
        Your cart is empty.
        <div className="mt-3">
          <Link href="/" className={buttonVariants({ size: "sm" })}>
            Browse restaurants
          </Link>
        </div>
      </EmptyState>
    );
  }
  if (error)
    return (
      <EmptyState tone="error">Couldn&apos;t load your order. Go back to the cart.</EmptyState>
    );
  if (!quote || addresses.loading) return <Skeleton className="h-96 w-full" />;

  const list = addresses.data?.addresses ?? [];
  const addressId = chosen ?? list.find((a) => a.isDefault)?.id ?? list[0]?.id;
  const blocked = quote.issues.length > 0;

  async function place() {
    if (!addressId || !cart.restaurantId) return;
    setPlacing(true);
    try {
      const res = await apiFetch<{ order: { id: string } }>("/api/orders", {
        method: "POST",
        body: {
          restaurantId: cart.restaurantId,
          lines: cart.lines,
          addressId,
          paymentMethod: "cod",
          notes: notes || undefined,
        },
      });
      clear();
      router.push(`/orders/${res.order.id}/placed`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not place your order");
      setPlacing(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Checkout</h1>
      <div className="grid gap-4 md:grid-cols-[2fr_1fr]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Delivery address</CardTitle>
              <Button size="sm" variant="outline" onClick={() => setAdding(true)}>
                + Add new address
              </Button>
            </CardHeader>
            <CardContent>
              {list.length === 0 ? (
                <p className="text-muted-foreground">Add a delivery address to continue.</p>
              ) : (
                <RadioGroup
                  value={addressId}
                  onValueChange={(v) => setChosen(String(v))}
                  className="grid gap-3"
                >
                  {list.map((a) => (
                    <Label key={a.id} className="flex items-start gap-2 font-normal">
                      <RadioGroupItem value={a.id} className="mt-1" />
                      <span>
                        <b>{a.label}</b> — {a.line1}, {a.city} {a.pincode}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment</CardTitle>
            </CardHeader>
            <CardContent>
              <Label className="font-normal">
                <input type="radio" checked readOnly /> Cash on delivery (only option in MVP)
              </Label>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Delivery instructions (optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                rows={2}
                maxLength={200}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ring the bell twice"
                aria-label="Delivery instructions"
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm"
              />
            </CardContent>
          </Card>
        </div>

        <aside>
          <Card>
            <CardHeader>
              <CardTitle>Order summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="text-sm font-medium">{quote.restaurant.name}</div>
              {quote.lines.map((l) => (
                <div key={l.itemId} className="flex justify-between text-sm">
                  <span>
                    {l.qty} × {l.name}
                  </span>
                  <span>₹{(l.linePaise / 100).toLocaleString("en-IN")}</span>
                </div>
              ))}
              <PriceSummary price={quote} />
              {blocked && (
                <p className="text-sm text-destructive">
                  Something changed in your cart.{" "}
                  <Link href="/cart" className="underline">
                    Review it
                  </Link>
                  .
                </p>
              )}
              <Button
                disabled={placing || blocked || !addressId}
                onClick={place}
                className="w-full"
              >
                {placing ? "Placing order…" : "Place order"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">Pay on delivery</p>
            </CardContent>
          </Card>
        </aside>
      </div>
      {adding && (
        <AddressDialog
          address={null}
          onClose={() => setAdding(false)}
          onSaved={() => void addresses.reload()}
        />
      )}
    </div>
  );
}
