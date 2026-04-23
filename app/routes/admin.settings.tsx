import { useEffect, useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Settings — VFC Admin" }];

interface Settings {
  general_whatsapp_link: string;
}

function SettingsSection({ title, description, children }: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
      <div className="border-b border-vfc-border px-6 py-5">
        <h2 className="text-base font-semibold text-vfc-white">{title}</h2>
        <p className="mt-0.5 text-sm text-vfc-muted">{description}</p>
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const [settings, setSettings] = useState<Settings>({ general_whatsapp_link: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json() as Promise<Settings>)
      .then((d) => setSettings({ general_whatsapp_link: d.general_whatsapp_link ?? "" }))
      .catch(() => setError("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      const data = (await res.json()) as { success?: boolean; error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to save");
      setSuccess("Settings saved successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-vfc-border bg-vfc-black px-4 py-2.5 text-vfc-white placeholder-vfc-muted outline-none transition-colors focus:border-vfc-yellow";

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-vfc-white">Settings</h1>
        <p className="mt-1 text-sm text-vfc-muted">
          Configure global defaults for Vibe From Cafe.
        </p>
      </div>

      {loading ? (
        <p className="text-sm text-vfc-muted">Loading…</p>
      ) : (
        <form onSubmit={handleSave} className="max-w-xl space-y-5">
          {/* Community */}
          <SettingsSection
            title="Community"
            description="Default WhatsApp group for members whose city doesn't have a chapter yet."
          >
            <div>
              <label htmlFor="general-wa" className="mb-1.5 block text-sm font-medium text-vfc-white">
                General WhatsApp Group Link
              </label>
              <input
                id="general-wa"
                type="url"
                value={settings.general_whatsapp_link}
                onChange={(e) => {
                  setSettings((s) => ({ ...s, general_whatsapp_link: e.target.value }));
                  setSuccess(null);
                }}
                className={inputClass}
                placeholder="https://chat.whatsapp.com/…"
              />
              <p className="mt-1.5 text-xs text-vfc-muted">
                Used as fallback when a registrant picks "Kota saya tidak ada di sini".
              </p>
            </div>
          </SettingsSection>

          {error && (
            <div className="rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg border border-green-400/40 bg-green-950/40 px-4 py-3 text-sm text-green-200">
              {success}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-vfc-yellow px-5 py-2.5 text-sm font-semibold text-vfc-black transition-colors hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save Settings"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
