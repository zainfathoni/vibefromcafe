export interface Cafe {
  slug: string;
  name: string;
  chapter: string;
  map_location: string | null;
  imageUrl?: string;
  mapUrl?: string;
  espresso_price: string | null;
  cappuccino_price: string | null;
  americano_price: string | null;
  wifi_speed: string | null;
  background_music: boolean | null;
  quiet_vibes: boolean | null;
  has_prayer_room: boolean | null;
  has_kids_area: boolean | null;
  has_private_room: boolean | null;
  has_ac: boolean | null;
  has_power_outlets: boolean | null;
  notes: string | null;
}

export type EventStatus = "published" | "draft";

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  cafeId?: string;
  imageUrl?: string;
  mapUrl?: string;
  status: EventStatus;
  tags: string[];
  createdAt: string;
}
