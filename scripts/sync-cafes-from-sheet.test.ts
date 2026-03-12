/** @vitest-environment node */

import { describe, expect, it, vi } from "vitest";

import {
  normalizePrice,
  parseCsv,
  parseYesNo,
  REQUIRED_HEADERS,
  slugify,
  syncCafesFromSheet,
  transformRows,
} from "./sync-cafes-from-sheet.mjs";

const SHEET_HEADERS = REQUIRED_HEADERS;

function makeSheetRow(overrides: Record<string, string> = {}) {
  return {
    Nama: "Cafe Contoh",
    Peta: "Jl. Kaliurang No. 1",
    "Harga Espresso": "Rp 20.000",
    "Harga Cappucino": "Rp 25.000",
    "Harga Americano": "Rp 18.000",
    "SpeedTest (mbps)": "120",
    "Background Musik": "Ya",
    "Pengunjung Sepi": "Tidak",
    Musholla: "Ya",
    "Tempat main anak": "Tidak",
    "Ada Private Room": "Ya",
    "Ada Ruang AC": "Ya",
    "Colokan listrik": "Ya",
    "Info Tambahan": "Dekat parkiran",
    ...overrides,
  };
}

function encodeCsvCell(value: string) {
  if (!/[",\r\n]/.test(value)) {
    return value;
  }

  return `"${value.replace(/"/g, '""')}"`;
}

function buildCsv(rows: Array<Record<string, string>>) {
  const lines = [
    SHEET_HEADERS.map(encodeCsvCell).join(","),
    ...rows.map((row) =>
      SHEET_HEADERS.map((header) => encodeCsvCell(row[header] ?? "")).join(","),
    ),
  ];

  return `${lines.join("\r\n")}\r\n`;
}

describe("transformRows", () => {
  it("preserves existing slug, imageUrl, and mapUrl when cafe name matches", () => {
    const rows = [makeSheetRow({ Nama: "The Bean House", Peta: "Maps Value" })];
    const currentCafes = [
      {
        slug: "existing-bean-house",
        name: "the bean house",
        chapter: "jogja",
        imageUrl: "/events/bean-house.jpg",
        mapUrl: "https://maps.example/bean-house",
      },
    ];

    const cafes = transformRows(rows, currentCafes);

    expect(cafes[0]).toMatchObject({
      slug: "existing-bean-house",
      imageUrl: "/events/bean-house.jpg",
      mapUrl: "https://maps.example/bean-house",
      map_location: "Maps Value",
    });
  });

  it("generates a slug for brand new cafes", () => {
    const rows = [makeSheetRow({ Nama: "Café Baru @ Jogja" })];

    const cafes = transformRows(rows, []);

    expect(cafes[0]?.slug).toBe(slugify("Café Baru @ Jogja"));
    expect(cafes[0]?.slug).toBe("cafe-baru-jogja");
  });

  it("throws when two rows resolve to the same slug", () => {
    const rows = [
      makeSheetRow({ Nama: "Cafe 1" }),
      makeSheetRow({ Nama: "Cafe-1" }),
    ];

    expect(() => transformRows(rows, [])).toThrow(
      'Duplicate slug "cafe-1" found at row 3.',
    );
  });

  it("maps all sheet fields into Cafe fields", () => {
    const rows = [
      makeSheetRow({
        Nama: "Field Mapping Cafe",
        Peta: "https://maps.app.goo.gl/mapping",
        "Harga Espresso": "rp 18.000,00",
        "Harga Cappucino": "",
        "Harga Americano": "Rp 25,000",
        "SpeedTest (mbps)": " 95 ",
        "Background Musik": "Ya",
        "Pengunjung Sepi": "Tidak",
        Musholla: "",
        "Tempat main anak": "Ya",
        "Ada Private Room": "Tidak",
        "Ada Ruang AC": "yes",
        "Colokan listrik": "no",
        "Info Tambahan": "  Cozy place  ",
      }),
    ];

    const cafes = transformRows(rows, []);

    expect(cafes[0]).toEqual({
      slug: "field-mapping-cafe",
      name: "Field Mapping Cafe",
      chapter: "jogja",
      map_location: "https://maps.app.goo.gl/mapping",
      espresso_price: "Rp18.000",
      cappuccino_price: null,
      americano_price: "Rp25000",
      wifi_speed: "95",
      background_music: true,
      quiet_vibes: false,
      has_prayer_room: null,
      has_kids_area: true,
      has_private_room: false,
      has_ac: true,
      has_power_outlets: false,
      notes: "Cozy place",
    });
  });
});

describe("syncCafesFromSheet", () => {
  it("does not write when generated cafes.json content is unchanged", async () => {
    const existingCafe = {
      slug: "alpha-cafe",
      name: "Alpha Cafe",
      chapter: "jogja",
      map_location: "Jl. Alpha No. 12",
      imageUrl: "/events/alpha-cafe.jpg",
      mapUrl: "https://maps.example/alpha-cafe",
      espresso_price: "Rp20.000",
      cappuccino_price: null,
      americano_price: "Rp25.000",
      wifi_speed: "100",
      background_music: true,
      quiet_vibes: false,
      has_prayer_room: null,
      has_kids_area: false,
      has_private_room: true,
      has_ac: true,
      has_power_outlets: false,
      notes: null,
    };

    const csvText = buildCsv([
      makeSheetRow({
        Nama: existingCafe.name,
        Peta: existingCafe.map_location,
        "Harga Espresso": existingCafe.espresso_price,
        "Harga Cappucino": "",
        "Harga Americano": existingCafe.americano_price,
        "SpeedTest (mbps)": existingCafe.wifi_speed,
        "Background Musik": "Ya",
        "Pengunjung Sepi": "Tidak",
        Musholla: "",
        "Tempat main anak": "Tidak",
        "Ada Private Room": "Ya",
        "Ada Ruang AC": "Ya",
        "Colokan listrik": "Tidak",
        "Info Tambahan": "",
      }),
    ]);

    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      text: vi.fn().mockResolvedValue(csvText),
    });
    const readFileImpl = vi
      .fn()
      .mockResolvedValue(`${JSON.stringify([existingCafe], null, 2).replace(/\n/g, "\r\n")}\r\n`);
    const writeFileImpl = vi.fn();
    const log = vi.fn();

    const result = await syncCafesFromSheet({
      csvUrl: "https://example.com/cafes.csv",
      cafesJsonPath: "/tmp/cafes.json",
      fetchImpl,
      readFileImpl,
      writeFileImpl,
      log,
    });

    expect(result.status).toBe("upToDate");
    expect(writeFileImpl).not.toHaveBeenCalled();
    expect(log).toHaveBeenCalledWith("cafes.json is already up to date.");
    expect(fetchImpl).toHaveBeenCalledWith("https://example.com/cafes.csv", {
      headers: { Accept: "text/csv" },
    });
  });
});

describe("parseYesNo", () => {
  it.each([
    ["Ya", true],
    ["Tidak", false],
    ["", null],
    ["Mungkin", null],
  ])("parses %s", (input, expected) => {
    expect(parseYesNo(input)).toBe(expected);
  });
});

describe("normalizePrice", () => {
  it("normalizes Rp prefix", () => {
    expect(normalizePrice("rp 18.000,00")).toBe("Rp18.000");
  });

  it("removes commas", () => {
    expect(normalizePrice("Rp 25,000")).toBe("Rp25000");
  });

  it("returns null for empty values", () => {
    expect(normalizePrice("")).toBeNull();
    expect(normalizePrice("   ")).toBeNull();
  });
});

describe("parseCsv", () => {
  it("parses quoted fields, escaped quotes, and CRLF line endings", () => {
    const csvText =
      'Nama,Info\r\n"Cafe, A","Says ""Hi"""\r\n"Line\r\nBreak",Plain\r\n';

    expect(parseCsv(csvText)).toEqual([
      ["Nama", "Info"],
      ["Cafe, A", 'Says "Hi"'],
      ["Line\r\nBreak", "Plain"],
    ]);
  });
});

describe("slugify", () => {
  it("removes accents and normalizes separators", () => {
    expect(slugify("Crème Brûlée & Co.")).toBe("creme-brulee-co");
  });

  it("trims leading and trailing hyphens", () => {
    expect(slugify("--- Special Cafe ---")).toBe("special-cafe");
  });
});
