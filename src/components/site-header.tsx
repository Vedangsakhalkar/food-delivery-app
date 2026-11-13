import Link from "next/link";
import { SearchBox } from "@/components/search-box";

/** Top bar from the mock-ups: red "Tadka" logo on the left, navigation slot on the right. */
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b bg-white px-5 py-3">
      <Link href="/" className="text-xl font-extrabold text-primary">
        Tadka
      </Link>
      <SearchBox />
      <nav className="ml-auto flex flex-wrap items-center gap-4 text-sm">{children}</nav>
    </header>
  );
}
