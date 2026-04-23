import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Chapters — VFC Admin" }];

interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

interface ChaptersResponse {
  cities?: City[];
  error?: string;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

const EMPTY_FORM = { id: "", name: "", whatsapp_link: "" };

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ChapterModalProps {
  initial?: City;
  existingIds: string[];
  onSave: (city: City) => Promise<void>;
  onClose: () => void;
}

function ChapterModal({ initial, existingIds, onSave, onClose }: ChapterModalProps) {
  const isEdit = Boolean(initial);
  const [form, setForm] = useState<City>(initial ?? EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateField(key: keyof City, value: string) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      // Auto-generate id from name when adding new
      if (!isEdit && key === "name") {
        next.id = slugify(value);
      }
      return next;
    });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.id.trim() || !form.name.trim()) {
      setError("ID and name are required.");
      return;
    }
    if (!isEdit && existingIds.includes(form.id.trim())) {
      setError(`ID "${form.id}" is already taken.`);
      return;
    }
    setSaving(true);
    try {
      await onSave({ id: form.id.trim(), name: form.name.trim(), whatsapp_link: form.whatsapp_link.trim() });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white placeholder-vfc-muted outline-none transition-colors focus:border-vfc-yellow";
  const labelClass = "mb-1.5 block text-sm font-medium text-vfc-white";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl border border-vfc-border bg-vfc-surface shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-vfc-border px-6 py-4">
          <h2 className="text-base font-bold text-vfc-white">{isEdit ? "Edit Chapter" : "Add Chapter"}</h2>
          <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-vfc-muted hover:text-vfc-white" aria-label="Close">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          <div>
            <label className={labelClass}>
              Chapter Name <span className="text-vfc-yellow">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass}
              placeholder="e.g. Yogyakarta"
            />
          </div>

          <div>
            <label className={labelClass}>
              ID <span className="text-vfc-yellow">*</span>
            </label>
            <input
              type="text"
              required
              value={form.id}
              readOnly={isEdit}
              onChange={(e) => updateField("id", e.target.value)}
              className={`${inputClass} ${isEdit ? "cursor-not-allowed opacity-60" : ""}`}
              placeholder="e.g. yogyakarta"
            />
            <p className="mt-1 text-xs text-vfc-muted">Lowercase slug, used as city_id in submissions</p>
          </div>

          <div>
            <label className={labelClass}>WhatsApp Group Link</label>
            <input
              type="url"
              value={form.whatsapp_link}
              onChange={(e) => updateField("whatsapp_link", e.target.value)}
              className={inputClass}
              placeholder="https://chat.whatsapp.com/…"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="rounded-lg border border-vfc-border px-4 py-2 text-sm font-medium text-vfc-muted transition-colors hover:text-vfc-white">
              Cancel
            </button>
            <button type="submit" disabled={saving} className="rounded-lg bg-vfc-yellow px-4 py-2 text-sm font-semibold text-vfc-black transition-colors hover:bg-yellow-300 disabled:opacity-50">
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Chapter"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminChapters() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [modal, setModal] = useState<"add" | City | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/admin/chapters")
      .then((r) => r.json() as Promise<ChaptersResponse>)
      .then((d) => setCities(d.cities ?? []))
      .catch(() => setError("Failed to load chapters"))
      .finally(() => setLoading(false));
  }, []);

  async function persist(updated: City[]) {
    setSaving(true);
    setError(null);
    setSuccess(null);
    const res = await fetch("/api/admin/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updated),
    });
    const data = (await res.json()) as { success?: boolean; error?: string };
    if (!res.ok) throw new Error(data.error ?? "Failed to save");
    setCities(updated);
    setSaving(false);
    return data;
  }

  async function handleSave(city: City) {
    const existing = cities.find((c) => c.id === city.id);
    const updated = existing
      ? cities.map((c) => (c.id === city.id ? city : c))
      : [...cities, city];
    await persist(updated);
    setSuccess(existing ? `"${city.name}" updated.` : `"${city.name}" added.`);
  }

  async function handleDelete(id: string) {
    const city = cities.find((c) => c.id === id);
    if (!confirm(`Delete chapter "${city?.name ?? id}"? This cannot be undone.`)) return;
    const updated = cities.filter((c) => c.id !== id);
    try {
      await persist(updated);
      setSuccess(`"${city?.name ?? id}" deleted.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  const editingCity = typeof modal === "object" && modal !== null ? modal : undefined;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vfc-white">Chapters</h1>
          <p className="mt-1 text-sm text-vfc-muted">
            Manage city chapters and their WhatsApp group links.
          </p>
        </div>
        <button
          type="button"
          onClick={() => { setModal("add"); setSuccess(null); setError(null); }}
          className="inline-flex items-center rounded-lg bg-vfc-yellow px-4 py-2 text-sm font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
        >
          + Add Chapter
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">{error}</div>
      )}
      {success && (
        <div className="mb-5 rounded-lg border border-green-400/40 bg-green-950/40 px-4 py-3 text-sm text-green-200">{success}</div>
      )}

      <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
        <div className="flex items-center justify-between border-b border-vfc-border px-5 py-3 text-sm text-vfc-muted">
          <span>Total chapters</span>
          <span className="font-semibold text-vfc-white">{cities.length}</span>
        </div>

        {loading ? (
          <p className="px-5 py-8 text-sm text-vfc-muted">Loading…</p>
        ) : cities.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-vfc-muted">No chapters yet.</p>
            <button
              type="button"
              onClick={() => setModal("add")}
              className="mt-3 text-sm text-vfc-yellow hover:underline"
            >
              Add the first chapter →
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-vfc-black/50 text-xs uppercase tracking-wide text-vfc-muted">
                <tr>
                  <th className="px-5 py-3 font-medium">Name</th>
                  <th className="px-5 py-3 font-medium">ID</th>
                  <th className="px-5 py-3 font-medium">WhatsApp Link</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id} className="border-t border-vfc-border/60 align-middle transition-colors hover:bg-vfc-black/20">
                    <td className="px-5 py-3.5 font-medium text-vfc-white">{city.name}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-vfc-muted">{city.id}</td>
                    <td className="px-5 py-3.5">
                      {city.whatsapp_link ? (
                        <a
                          href={city.whatsapp_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-xs truncate text-vfc-yellow hover:underline"
                        >
                          {city.whatsapp_link}
                        </a>
                      ) : (
                        <span className="text-vfc-muted">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => { setModal(city); setSuccess(null); setError(null); }}
                          className="rounded-md border border-vfc-border px-3 py-1.5 text-xs font-medium text-vfc-muted transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={() => void handleDelete(city.id)}
                          className="rounded-md border border-red-900/50 px-3 py-1.5 text-xs font-medium text-red-400/70 transition-colors hover:border-red-400 hover:text-red-400 disabled:opacity-40"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <ChapterModal
          initial={editingCity}
          existingIds={cities.map((c) => c.id)}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}
    </div>
  );
}
