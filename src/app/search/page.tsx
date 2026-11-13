import { Suspense } from "react";
import { SearchResults } from "@/components/search/search-results";

export const metadata = { title: "Search | Tadka" };

export default function SearchPage() {
  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Search</h1>
      <Suspense>
        <SearchResults />
      </Suspense>
    </div>
  );
}
