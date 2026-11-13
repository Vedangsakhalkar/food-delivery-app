"use client";

import { use } from "react";
import { ItemForm } from "@/components/owner/item-form";

export default function OwnerItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ItemForm id={id} />;
}
