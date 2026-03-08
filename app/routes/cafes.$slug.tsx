import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import cafes from "../data/cafes.json";
import type { Cafe } from "../data/types";
import type { Route } from "./+types/cafes.$slug";

export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data) {
    return [{ title: "Cafe Not Found — Vibe From Cafe" }];
  }
  return [
    { title: `${data.cafe.name} — Vibe From Cafe` },
    {
      name: "description",
      content: `${data.cafe.name} in ${data.cafe.map_location ?? "Jogja"} — WiFi, amenities, and prices for remote workers.`,
    },
  ];
};

export function loader({ params }: Route.LoaderArgs) {
  const cafe = (cafes as Cafe[]).find((c) => c.slug === params.slug);
  if (!cafe) {
    throw new Response("Cafe not found", { status: 404 });
  }
  return { cafe };
}

function Badge({
  label,
  active,
}: {
  label: string;
  active: boolean | null;
}) {
  if (active === null) return null;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
        active
          ? "bg-leaf-500/10 text-leaf-600 border border-leaf-500/20"
          : "bg-gray-100 text-gray-400 border border-gray-200 line-through"
      }`}
    >
      {label}
    </span>
  );
}

function PriceRow({
  label,
  price,
}: {
  label: string;
  price: string | null;
}) {
  if (!price) return null;
  return (
    <div className="flex justify-between py-2 border-b border-coffee-100">
      <span className="text-coffee-600">{label}</span>
      <span className="font-medium text-coffee-800">{price}</span>
    </div>
  );
}

export default function CafeDetail({ loaderData }: Route.ComponentProps) {
  const { cafe } = loaderData;
  const hasPrices =
    cafe.espresso_price || cafe.cappuccino_price || cafe.americano_price;

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        to="/cafes"
        className="text-sm text-coffee-500 hover:text-coffee-700 mb-6 inline-block"
      >
        &larr; Back to Cafes
      </Link>

      <h1 className="text-3xl font-bold text-coffee-800 mb-2">{cafe.name}</h1>

      {cafe.map_location && (
        <p className="text-coffee-400 mb-6">{cafe.map_location}</p>
      )}

      {/* WiFi Speed */}
      {cafe.wifi_speed && (
        <div className="bg-white rounded-xl border border-coffee-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-coffee-600 uppercase tracking-wide mb-2">
            WiFi Speed
          </h2>
          <p className="text-2xl font-bold text-coffee-800">
            {cafe.wifi_speed}{" "}
            <span className="text-sm font-normal text-coffee-400">Mbps</span>
          </p>
          {cafe.wifi_speed.includes(":") && (
            <p className="text-xs text-coffee-400 mt-1">
              Format: download : upload
            </p>
          )}
        </div>
      )}

      {/* Prices */}
      {hasPrices && (
        <div className="bg-white rounded-xl border border-coffee-100 p-5 mb-6">
          <h2 className="text-sm font-semibold text-coffee-600 uppercase tracking-wide mb-3">
            Prices
          </h2>
          <PriceRow label="Espresso" price={cafe.espresso_price} />
          <PriceRow label="Cappuccino" price={cafe.cappuccino_price} />
          <PriceRow label="Americano" price={cafe.americano_price} />
        </div>
      )}

      {/* Amenities */}
      <div className="bg-white rounded-xl border border-coffee-100 p-5 mb-6">
        <h2 className="text-sm font-semibold text-coffee-600 uppercase tracking-wide mb-3">
          Amenities
        </h2>
        <div className="flex flex-wrap gap-2">
          <Badge label="Musholla" active={cafe.has_prayer_room} />
          <Badge label="AC Room" active={cafe.has_ac} />
          <Badge label="Power Outlets" active={cafe.has_power_outlets} />
          <Badge label="Private Room" active={cafe.has_private_room} />
          <Badge label="Background Music" active={cafe.background_music} />
          <Badge label="Quiet Vibes" active={cafe.quiet_vibes} />
          <Badge label="Kids Area" active={cafe.has_kids_area} />
        </div>
      </div>

      {/* Notes */}
      {cafe.notes && (
        <div className="bg-warm-100 rounded-xl border border-warm-200 p-5 mb-6">
          <h2 className="text-sm font-semibold text-coffee-600 uppercase tracking-wide mb-2">
            Notes
          </h2>
          <p className="text-coffee-700">{cafe.notes}</p>
        </div>
      )}

      {/* Map Link */}
      {cafe.map_location && (
        <a
          href={
            cafe.map_location.startsWith("http")
              ? cafe.map_location
              : `https://www.google.com/maps/search/${encodeURIComponent(cafe.name + " " + cafe.map_location + " Jogja")}`
          }
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-coffee-700 hover:bg-coffee-800 text-white font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          View on Google Maps
        </a>
      )}
    </div>
  );
}
