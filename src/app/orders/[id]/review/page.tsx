"use client";

import { use } from "react";
import { ReviewForm } from "@/components/orders/review-form";

export default function ReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ReviewForm id={id} />;
}
