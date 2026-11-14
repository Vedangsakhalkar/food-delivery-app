import { Suspense } from "react";
import { RestaurantList } from "@/components/restaurants/restaurant-list";
import { SearchBox } from "@/components/search-box";

export default function Home() {
  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#db3542] via-[#c42a3b] to-[#8f1d2c] px-6 py-10 text-white shadow-md sm:px-10 sm:py-14">
        <div aria-hidden className="absolute -top-16 -right-10 size-64 rounded-full bg-white/10" />
        <div
          aria-hidden
          className="absolute -bottom-24 left-1/3 size-72 rounded-full bg-white/10"
        />
        <div aria-hidden className="absolute top-6 right-8 hidden text-7xl drop-shadow-lg sm:block">
          🍛
        </div>
        <div
          aria-hidden
          className="absolute right-36 bottom-6 hidden text-6xl drop-shadow-lg sm:block"
        >
          🥟
        </div>
        <div
          aria-hidden
          className="absolute right-6 bottom-10 hidden text-5xl drop-shadow-lg md:block"
        >
          🍕
        </div>
        <div className="relative max-w-xl">
          <h1 className="text-3xl leading-tight font-extrabold tracking-tight sm:text-5xl">
            Hungry? Foodzie it.
          </h1>
          <p className="mt-3 text-base text-white/90 sm:text-lg">
            Order from the best restaurants near you. Pay cash when it arrives.
          </p>
          <div className="mt-6 text-foreground">
            <SearchBox size="lg" />
          </div>
        </div>
      </section>

      <div>
        <h2 className="mb-3 text-xl font-bold">Restaurants near you</h2>
        <Suspense>
          <RestaurantList />
        </Suspense>
      </div>
    </div>
  );
}
