#!/usr/bin/env node

import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DEFAULT_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1brxuvXq8PZD-EsUlxf6h0Vpl8mif81vxw-OgmqrJYK0/export?format=csv";

export const REQUIRED_HEADERS = [
  "Nama",
  "Peta",
  "Harga Espresso",
  "Harga Cappucino",
  "Harga Americano",
  "SpeedTest (mbps)",
  "Background Musik",
  "Pengunjung Sepi",
  "Musholla",
  "Tempat main anak",
  "Ada Private Room",
  "Ada Ruang AC",
  "Colokan listrik",
  "Info Tambahan",
];

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, "..");
const CAFES_JSON_PATH = path.join(PROJECT_ROOT, "app/data/cafes.json");

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

export async function main() {
  await syncCafesFromSheet();
}

export async function syncCafesFromSheet({
  csvUrl = process.env.CAFES_SHEET_CSV_URL ?? DEFAULT_CSV_URL,
  cafesJsonPath = CAFES_JSON_PATH,
  fetchImpl = fetch,
  readFileImpl = readFile,
  writeFileImpl = writeFile,
  log = console.log,
} = {}) {
  const csvText = await fetchCsv(csvUrl, fetchImpl);
  const rows = parseCsv(csvText);

  if (rows.length < 2) {
    throw new Error("Sheet CSV did not contain any cafe rows.");
  }

  const header = rows[0].map(normalizeHeader);
  validateHeaders(header);

  const records = rows
    .slice(1)
    .map((row) => toRecord(header, row))
    .filter((row) => row.Nama);

  const currentRaw = await readFileImpl(cafesJsonPath, "utf8");
  const currentCafes = JSON.parse(currentRaw);

  const cafes = transformRows(records, currentCafes);
  const nextRaw = `${JSON.stringify(cafes, null, 2)}\n`;

  if (normalizeNewlines(currentRaw) === normalizeNewlines(nextRaw)) {
    log("cafes.json is already up to date.");
    return { status: "upToDate", cafes };
  }

  await writeFileImpl(cafesJsonPath, nextRaw, "utf8");
  log(`Updated app/data/cafes.json with ${cafes.length} cafes.`);
  return { status: "updated", cafes };
}

export async function fetchCsv(csvUrl, fetchImpl = fetch) {
  const response = await fetchImpl(csvUrl, {
    headers: { Accept: "text/csv" },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch cafe sheet CSV (${response.status} ${response.statusText}).`,
    );
  }

  return response.text();
}

function validateHeaders(header) {
  const missing = REQUIRED_HEADERS.filter((requiredHeader) => {
    return !header.includes(requiredHeader);
  });

  if (missing.length > 0) {
    throw new Error(
      `Sheet CSV is missing required columns: ${missing.join(", ")}. Found: ${header.join(
        ", ",
      )}`,
    );
  }
}

function toRecord(header, row) {
  const record = {};
  for (let index = 0; index < header.length; index += 1) {
    record[header[index]] = (row[index] ?? "").trim();
  }

  return record;
}

export function transformRows(rows, currentCafes) {
  const byName = new Map(
    currentCafes.map((cafe) => [normalizeLookup(cafe.name), cafe]),
  );
  const usedSlugs = new Set();

  return rows.map((row, rowIndex) => {
    const name = row.Nama;
    const existingCafe = byName.get(normalizeLookup(name));
    const slug = existingCafe?.slug ?? slugify(name);
    const optionalLinks = {};

    if (usedSlugs.has(slug)) {
      throw new Error(`Duplicate slug "${slug}" found at row ${rowIndex + 2}.`);
    }

    usedSlugs.add(slug);

    if (existingCafe?.imageUrl) {
      optionalLinks.imageUrl = existingCafe.imageUrl;
    }

    if (existingCafe?.mapUrl) {
      optionalLinks.mapUrl = existingCafe.mapUrl;
    }

    return {
      slug,
      name,
      chapter: "jogja",
      map_location: toNullableString(row.Peta),
      ...optionalLinks,
      espresso_price: normalizePrice(row["Harga Espresso"]),
      cappuccino_price: normalizePrice(row["Harga Cappucino"]),
      americano_price: normalizePrice(row["Harga Americano"]),
      wifi_speed: toNullableString(row["SpeedTest (mbps)"]),
      background_music: parseYesNo(row["Background Musik"]),
      quiet_vibes: parseYesNo(row["Pengunjung Sepi"]),
      has_prayer_room: parseYesNo(row.Musholla),
      has_kids_area: parseYesNo(row["Tempat main anak"]),
      has_private_room: parseYesNo(row["Ada Private Room"]),
      has_ac: parseYesNo(row["Ada Ruang AC"]),
      has_power_outlets: parseYesNo(row["Colokan listrik"]),
      notes: toNullableString(row["Info Tambahan"]),
    };
  });
}

export function parseYesNo(value) {
  const normalized = toNullableString(value)?.toLowerCase();

  if (!normalized) {
    return null;
  }

  if (["ya", "yes", "true"].includes(normalized)) {
    return true;
  }

  if (["tidak", "no", "false"].includes(normalized)) {
    return false;
  }

  return null;
}

export function normalizePrice(value) {
  const normalized = toNullableString(value);

  if (!normalized) {
    return null;
  }

  return normalized
    .replace(/,00$/, "")
    .replace(/,/g, "")
    .replace(/^rp\s*/i, "Rp")
    .replace(/^Rp\s+/, "Rp");
}

function toNullableString(value) {
  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function normalizeLookup(value) {
  return value.trim().toLowerCase();
}

function normalizeHeader(value) {
  return value.replace(/^\uFEFF/, "").trim();
}

function normalizeNewlines(value) {
  return value.replace(/\r\n/g, "\n");
}

export function slugify(value) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let insideQuotes = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (char === '"') {
      if (insideQuotes && text[index + 1] === '"') {
        cell += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
      continue;
    }

    if (char === "," && !insideQuotes) {
      row.push(cell);
      cell = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !insideQuotes) {
      if (char === "\r" && text[index + 1] === "\n") {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  return rows;
}
