import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t bg-white px-5 py-4 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-center justify-between gap-2">
        <span>© Dabba</span>
        <nav aria-label="Footer">
          <Link href="/privacy" className="underline-offset-2 hover:underline">
            Privacy policy
          </Link>
        </nav>
      </div>
    </footer>
  );
}
