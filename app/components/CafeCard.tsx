import { Link } from "react-router";
import type { Cafe } from "../data/types";

function AmenityBadge({ label, active }: { label: string; active: boolean | null }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-leaf-500/10 text-leaf-600 border border-leaf-500/20">
      {label}
    </span>
  );
}

function WifiSpeedBadge({ speed }: { speed: string | null }) {
  if (!speed) return null;

  const downloadSpeed = parseFloat(speed.split(":")[0].split(" ")[0]);
  let color = "bg-red-100 text-red-700 border-red-200";
  if (downloadSpeed >= 100) color = "bg-green-100 text-green-700 border-green-200";
  else if (downloadSpeed >= 50) color = "bg-yellow-100 text-yellow-700 border-yellow-200";

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${color}`}>
      {speed} Mbps
    </span>
  );
}

export default function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <Link
      to={`/cafes/${cafe.slug}`}
      className="block bg-white rounded-xl border border-coffee-100 shadow-sm hover:shadow-md hover:border-coffee-200 transition-all p-5 group"
    >
      <h3 className="font-semibold text-coffee-800 group-hover:text-coffee-600 mb-2">
        {cafe.name}
      </h3>

      {cafe.map_location && (
        <p className="text-sm text-coffee-400 mb-3">{cafe.map_location}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-3">
        <WifiSpeedBadge speed={cafe.wifi_speed} />
      </div>

      <div className="flex flex-wrap gap-1.5">
        <AmenityBadge label="Musholla" active={cafe.has_prayer_room} />
        <AmenityBadge label="AC" active={cafe.has_ac} />
        <AmenityBadge label="Power" active={cafe.has_power_outlets} />
        <AmenityBadge label="Private Room" active={cafe.has_private_room} />
        <AmenityBadge label="Quiet" active={cafe.quiet_vibes} />
        <AmenityBadge label="Kids Area" active={cafe.has_kids_area} />
      </div>
    </Link>
  );
}
