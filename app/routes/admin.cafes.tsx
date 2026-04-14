import { useState } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import type { Cafe } from "../data/types";

export const meta: MetaFunction = () => [
  { title: "Cafes — VFC Admin" },
];

function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url, "https://placeholder.invalid");
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

export default function AdminCafes() {
  const allCafes = cafes as Cafe[];
  const [search, setSearch] = useState("");

  const filtered = search
    ? allCafes.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.slug.toLowerCase().includes(search.toLowerCase()),
      )
    : allCafes;

  const withImage = allCafes.filter((c) => c.imageUrl).length;
  const withMap = allCafes.filter((c) => c.mapUrl).length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vfc-white">Cafes Directory</h1>
          <p className="mt-1 text-sm text-vfc-muted">
            {allCafes.length} cafes — {withImage} with image, {withMap} with map URL.
            Edit data in <code className="text-vfc-white/70">cafes.json</code>.
          </p>
        </div>
        <input
          type="text"
          placeholder="Search cafes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-52 rounded-lg border border-vfc-border bg-vfc-black px-4 py-2 text-sm text-vfc-white outline-none transition-colors placeholder:text-vfc-muted focus:border-vfc-yellow"
        />
      </div>

      <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
        <div className="flex items-center justify-between border-b border-vfc-border px-5 py-3 text-sm text-vfc-muted">
          <span>{search ? `${filtered.length} matching` : "Total cafes"}</span>
          <span className="font-semibold text-vfc-white">{filtered.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-vfc-black/50 text-xs uppercase tracking-wide text-vfc-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Chapter</th>
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-5 py-3 font-medium">WiFi</th>
                <th className="px-5 py-3 font-medium">Image</th>
                <th className="px-5 py-3 font-medium">Map</th>
                <th className="px-5 py-3 font-medium">View</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td className="px-5 py-8 text-vfc-muted" colSpan={7}>No cafes found.</td></tr>
              ) : filtered.map((cafe) => (
                <tr key={cafe.slug} className="border-t border-vfc-border/60 align-top transition-colors hover:bg-vfc-black/20">
                  <td className="px-5 py-3.5 font-medium text-vfc-white">{cafe.name}</td>
                  <td className="px-5 py-3.5 text-vfc-white/90">{cafe.chapter}</td>
                  <td className="px-5 py-3.5 text-vfc-white/90">{cafe.map_location ?? "-"}</td>
                  <td className="px-5 py-3.5 text-vfc-white/90">{cafe.wifi_speed ? `${cafe.wifi_speed} Mbps` : "-"}</td>
                  <td className="px-5 py-3.5">
                    {cafe.imageUrl
                      ? <span className="text-xs font-medium text-green-400">Yes</span>
                      : <span className="text-vfc-muted">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    {cafe.mapUrl && isSafeUrl(cafe.mapUrl)
                      ? <a href={cafe.mapUrl} target="_blank" rel="noopener noreferrer" className="text-vfc-yellow hover:underline">Link</a>
                      : <span className="text-vfc-muted">—</span>}
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      to={`/cafes/${cafe.slug}`}
                      className="inline-flex items-center rounded-md border border-vfc-border px-3 py-1.5 text-xs font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
