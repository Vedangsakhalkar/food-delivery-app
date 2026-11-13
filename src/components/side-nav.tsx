"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Left sidebar used by the owner and admin areas (mocks O2 and M1). */
export function SideNav({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  return (
    <aside className="flex gap-1 overflow-x-auto md:w-52 md:flex-none md:flex-col">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          className={cn(
            "rounded-lg px-3 py-2 text-sm whitespace-nowrap hover:bg-muted",
            pathname.startsWith(l.href) && "bg-primary/10 font-semibold text-red-800",
          )}
        >
          {l.label}
        </Link>
      ))}
    </aside>
  );
}
