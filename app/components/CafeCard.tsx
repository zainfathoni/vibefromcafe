import { Link } from "react-router";
import type { Cafe } from "../data/types";

function AmenityBadge({ label, active }: { label: string; active: boolean | null }) {
  if (!active) return null;
  return (
    <span className="inline-flex items-center rounded border border-vfc-yellow/30 bg-vfc-yellow/10 px-2 py-0.5 text-xs font-medium text-vfc-yellow">
      {label}
    </span>
  );
}

function WifiSpeedBadge({ speed }: { speed: string | null }) {
  if (!speed) return null;

  const downloadSpeed = parseFloat(speed.split(":")[0].split(" ")[0]);
  let color = "bg-red-500/20 text-red-200 border-red-500/50";
  if (downloadSpeed >= 100) color = "bg-green-500/20 text-green-200 border-green-500/50";
  else if (downloadSpeed >= 50) color = "bg-yellow-500/20 text-yellow-200 border-yellow-500/50";

  return (
    <span className={`inline-flex items-center rounded border px-2 py-0.5 text-xs font-semibold tracking-wide ${color}`}>
      {speed} Mbps
    </span>
  );
}

export default function CafeCard({ cafe }: { cafe: Cafe }) {
  return (
    <Link
      to={`/cafes/${cafe.slug}`}
      className="group block rounded-xl border border-vfc-border bg-vfc-surface p-5 transition-all hover:-translate-y-0.5 hover:border-vfc-yellow hover:shadow-[0_0_24px_rgba%28245%2C196%2C0%2C0.18%29]"
    >
      <h3 className="mb-2 font-semibold text-vfc-white group-hover:text-vfc-yellow">
        {cafe.name}
      </h3>

      {cafe.map_location && (
        <p className="mb-3 text-sm text-vfc-muted">{cafe.map_location}</p>
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
