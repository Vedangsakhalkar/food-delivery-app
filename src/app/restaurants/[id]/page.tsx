"use client";

import { use } from "react";
import { RestaurantView } from "@/components/restaurants/restaurant-view";

export default function RestaurantPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <RestaurantView id={id} />;
}
