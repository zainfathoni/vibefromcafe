-- Initial D1 schema for Vibe From Cafe

CREATE TABLE IF NOT EXISTS cities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  whatsapp_link TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS submissions (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  city_id TEXT,
  role TEXT NOT NULL,
  role_other TEXT,
  company TEXT,
  is_freelancer INTEGER NOT NULL DEFAULT 0,
  whatsapp TEXT NOT NULL DEFAULT '',
  motivations TEXT NOT NULL DEFAULT '[]',
  referral TEXT,
  referral_source TEXT,
  referral_name TEXT,
  invitation_status TEXT NOT NULL DEFAULT 'signed_up',
  invited_by TEXT,
  invited_at TEXT,
  approved_by TEXT,
  approved_at TEXT,
  ip TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL,
  time TEXT NOT NULL DEFAULT '',
  location TEXT NOT NULL DEFAULT '',
  cafe_id TEXT,
  image_url TEXT,
  map_url TEXT,
  status TEXT NOT NULL DEFAULT 'published',
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  is_deleted INTEGER NOT NULL DEFAULT 0
);
