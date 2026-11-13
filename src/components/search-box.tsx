"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { Input } from "@/components/ui/input";

function Box() {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="w-full max-w-sm">
      <Input
        type="search"
        aria-label="Search restaurants or dishes"
        placeholder="Search restaurant or dish"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
    </form>
  );
}

export function SearchBox() {
  return (
    <Suspense>
      <Box />
    </Suspense>
  );
}
