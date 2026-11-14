import Link from "next/link";
import { MapPin } from "lucide-react";
import { SearchBox } from "@/components/search-box";

/** Top bar: logo, city, search, then navigation (cart, orders, account). */
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
        <Link
          href="/"
          className="flex items-center gap-2 text-2xl font-extrabold tracking-tight text-primary"
        >
          <span
            aria-hidden
            className="grid size-9 place-items-center rounded-xl bg-primary text-lg shadow-sm"
          >
            🍛
          </span>
          Foodzie
        </Link>
        <span className="hidden items-center gap-1 rounded-full bg-muted px-3 py-1.5 text-sm text-muted-foreground md:flex">
          <MapPin className="size-4 text-primary" aria-hidden /> Pune
        </span>
        <div className="order-last w-full md:order-none md:max-w-md md:flex-1">
          <SearchBox hideOnHome />
        </div>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium sm:gap-3">
          {children}
        </nav>
      </div>
    </header>
  );
}
