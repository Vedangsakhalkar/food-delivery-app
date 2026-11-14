import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-10 border-t bg-white px-4 py-8 text-sm text-muted-foreground">
      <div className="mx-auto flex max-w-[1100px] flex-wrap items-start justify-between gap-6">
        <div className="max-w-xs">
          <div className="flex items-center gap-2 text-xl font-extrabold text-primary">
            <span aria-hidden>🍛</span> Foodzie
          </div>
          <p className="mt-2">
            Hot food from the restaurants you love, delivered to your door. Pay cash on delivery.
          </p>
        </div>
        <nav aria-label="Footer" className="flex flex-col gap-2">
          <Link href="/" className="hover:text-foreground hover:underline">
            Restaurants
          </Link>
          <Link href="/signup" className="hover:text-foreground hover:underline">
            Own a restaurant? Join Foodzie
          </Link>
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy policy
          </Link>
        </nav>
      </div>
      <div className="mx-auto mt-6 max-w-[1100px] border-t pt-4 text-xs">© Foodzie</div>
    </footer>
  );
}
