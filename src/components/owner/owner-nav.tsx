"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/owner/restaurant", label: "Restaurant profile" },
  { href: "/owner/menu", label: "Menu" },
  { href: "/owner/orders", label: "Live orders" },
  { href: "/owner/history", label: "Order history" },
];

/** Left sidebar of the owner area (mock O2-O6). */
export function OwnerNav() {
  const pathname = usePathname();
  return (
    <aside className="flex gap-1 overflow-x-auto md:w-52 md:flex-none md:flex-col">
      {LINKS.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-muted",
            pathname.startsWith(l.href) && "bg-primary/10 font-semibold text-primary",
          )}
        >
          {l.label}
        </Link>
      ))}
    </aside>
  );
}
