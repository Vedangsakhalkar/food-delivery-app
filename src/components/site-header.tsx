import Link from "next/link";

/** Top bar from the mock-ups: red "Dabba" logo on the left, navigation slot on the right. */
export function SiteHeader({ children }: { children?: React.ReactNode }) {
  return (
    <header className="sticky top-0 z-10 flex flex-wrap items-center gap-4 border-b bg-white px-5 py-3">
      <Link href="/" className="text-xl font-extrabold text-primary">
        Dabba
      </Link>
      <nav className="ml-auto flex flex-wrap items-center gap-4 text-sm">{children}</nav>
    </header>
  );
}
