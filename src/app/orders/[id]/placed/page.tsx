"use client";

import { use } from "react";
import { OrderPlaced } from "@/components/checkout/order-placed";

export default function OrderPlacedPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <OrderPlaced id={id} />;
}
