"use client";

import { Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { cn } from "@/lib/utils";

function Box({ size, hideOnHome }: { size: "sm" | "lg"; hideOnHome: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get("q") ?? "");

  if (hideOnHome && pathname === "/") return null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    if (q) router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form onSubmit={submit} role="search" className="w-full">
      <label className="relative block">
        <span className="sr-only">Search restaurants or dishes</span>
        <Search
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 text-muted-foreground",
            size === "lg" ? "left-4 size-5" : "left-3 size-4",
          )}
        />
        <input
          type="search"
          placeholder={
            size === "lg"
              ? "Search for a restaurant or a dish, e.g. biryani"
              : "Search restaurant or dish"
          }
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className={cn(
            "w-full rounded-full border bg-white shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/15",
            size === "lg" ? "h-13 pr-5 pl-12 text-base" : "h-10 pr-4 pl-9 text-sm",
          )}
        />
      </label>
    </form>
  );
}

/** Search field. The small header version hides itself on the home page, where the hero has a big one. */
export function SearchBox({
  size = "sm",
  hideOnHome = false,
}: {
  size?: "sm" | "lg";
  hideOnHome?: boolean;
}) {
  return (
    <Suspense>
      <Box size={size} hideOnHome={hideOnHome} />
    </Suspense>
  );
}
