import { useState } from "react";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import CafeCard from "../components/CafeCard";
import type { Cafe } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Cafe Directory — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Find the best cafes for Vibe Coding, the first active theme in the Vibe From Cafe community.",
  },
];

type FilterKey =
  | "has_ac"
  | "has_prayer_room"
  | "has_power_outlets"
  | "quiet_vibes"
  | "has_private_room"
  | "has_kids_area";

const filters: { key: FilterKey; label: string }[] = [
  { key: "has_ac", label: "AC" },
  { key: "has_prayer_room", label: "Musholla" },
  { key: "has_power_outlets", label: "Power Outlets" },
  { key: "quiet_vibes", label: "Quiet Vibes" },
  { key: "has_private_room", label: "Private Room" },
  { key: "has_kids_area", label: "Kids Area" },
];

export default function CafesIndex() {
  const [activeFilters, setActiveFilters] = useState<Set<FilterKey>>(
    new Set()
  );
  const [cityFilter, setCityFilter] = useState<string>("all");

  function toggleFilter(key: FilterKey) {
    setActiveFilters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  const allCafes = cafes as Cafe[];
  const filteredCafes = allCafes.filter((cafe) => {
    if (cityFilter !== "all" && cafe.chapter !== cityFilter) return false;
    for (const key of activeFilters) {
      if (!cafe[key]) return false;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold text-vfc-white mb-2">
        Cafe Directory
      </h1>
      <p className="text-vfc-muted mb-8">
        {filteredCafes.length} cafes found. Real data from the community.
      </p>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-8">
        <span className="text-sm font-medium text-vfc-white">Filter:</span>

        {/* City filter */}
        <select
          value={cityFilter}
          onChange={(e) => setCityFilter(e.target.value)}
          className="rounded-lg border border-vfc-border bg-vfc-surface px-3 py-1.5 text-sm text-vfc-white focus:outline-none focus:ring-2 focus:ring-vfc-yellow"
        >
          <option value="all">All Cities</option>
          <option value="jogja">Jogja</option>
        </select>

        {/* Amenity filters */}
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => toggleFilter(f.key)}
            className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
              activeFilters.has(f.key)
                ? "bg-vfc-yellow text-vfc-black border-vfc-yellow"
                : "bg-vfc-surface text-vfc-white border-vfc-border hover:border-vfc-yellow hover:text-vfc-yellow"
            }`}
          >
            {f.label}
          </button>
        ))}

        {activeFilters.size > 0 && (
          <button
            onClick={() => setActiveFilters(new Set())}
            className="text-sm text-vfc-muted hover:text-vfc-yellow underline"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Cafe Grid */}
      {filteredCafes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCafes.map((cafe) => (
            <CafeCard key={cafe.slug} cafe={cafe} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-vfc-muted">
          <p className="text-lg mb-2">No cafes match your filters.</p>
          <button
            onClick={() => setActiveFilters(new Set())}
            className="text-vfc-yellow hover:text-yellow-300 underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
