import { RestaurantList } from "@/components/restaurants/restaurant-list";

export default function Home() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Restaurants in Pune</h1>
      <RestaurantList />
    </div>
  );
}
