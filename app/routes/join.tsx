import { useEffect, useRef, useState, type FormEvent } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Join — Vibe From Cafe" },
  {
    name: "description",
    content:
      "Join Vibe From Cafe support system for tech workers navigating the AI shift through learning, building, and trusted referrals.",
  },
];

interface City {
  id: string;
  name: string;
  whatsapp_link: string;
}

interface CitiesResponse {
  cities: City[];
  general_whatsapp_link: string;
}

const OTHER_CITY_ID = "__other__";

const ROLES = [
  "Frontend Developer",
  "Backend Developer",
  "Fullstack Developer",
  "Mobile Developer",
  "UI/UX Designer",
  "Product Manager",
  "Data Analyst / Data Scientist",
  "DevOps / Cloud Engineer",
  "AI / ML Engineer",
  "Digital Marketer",
  "Content Creator",
  "Founder / Entrepreneur",
  "Student",
  "Career Switcher (into tech)",
  "Other",
];

const MOTIVATIONS = [
  "Belajar AI & tools terbaru bareng komunitas",
  "Cari teman build project bareng (collab)",
  "Upgrade skill biar nggak ketinggalan AI shift",
  "Networking sama tech workers sekota",
  "Dapat referral & peluang freelance / kerja",
  "Mau ikut event & workshop VFC",
  "Pengen sharing pengalaman & ngajarin orang lain",
  "Cari mentor atau jadi mentor",
  "Butuh support system di tengah perubahan industri",
  "Sekadar penasaran & explore dulu",
];

const REFERRAL_SOURCES = [
  { value: "friend", label: "A friend" },
  { value: "instagram", label: "Instagram" },
  { value: "threads", label: "Threads" },
  { value: "twitter", label: "X (Twitter)" },
  { value: "github", label: "GitHub" },
  { value: "other", label: "Other" },
];

type FormState = {
  name: string;
  city_id: string;
  role: string;
  role_other: string;
  company: string;
  is_freelancer: boolean;
  whatsapp: string;
  motivations: string[];
  referral: string;
};

const initialForm: FormState = {
  name: "",
  city_id: "",
  role: "",
  role_other: "",
  company: "",
  is_freelancer: false,
  whatsapp: "",
  motivations: [],
  referral: "",
};

function validateWhatsapp(value: string): boolean {
  const cleaned = value.replace(/[\s-]/g, "");
  const digitsOnly = cleaned.startsWith("+") ? cleaned.slice(1) : cleaned;
  if (!/^\d+$/.test(digitsOnly)) return false;
  return cleaned.startsWith("08") || cleaned.startsWith("+62");
}

const inputClass = (hasError: boolean) =>
  `w-full rounded-lg border bg-vfc-black px-4 py-3 text-vfc-white placeholder-vfc-muted outline-none transition-colors focus:border-vfc-yellow ${
    hasError ? "border-red-400/60" : "border-vfc-border"
  }`;

const selectClass = (hasError: boolean, isEmpty: boolean) =>
  `w-full rounded-lg border bg-vfc-black px-4 py-3 outline-none transition-colors focus:border-vfc-yellow ${
    hasError ? "border-red-400/60" : "border-vfc-border"
  } ${isEmpty ? "text-vfc-muted" : "text-vfc-white"}`;

export default function Join() {
  const [form, setForm] = useState<FormState>(initialForm);
  const [cities, setCities] = useState<City[]>([]);
  const [generalWaLink, setGeneralWaLink] = useState("");
  const [citiesLoading, setCitiesLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState | "motivations_group", string>>>({});
  const honeypotRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/cities")
      .then((res) => res.json() as Promise<CitiesResponse>)
      .then((data) => {
        setCities(data.cities ?? []);
        setGeneralWaLink(data.general_whatsapp_link ?? "");
      })
      .catch(() => {
        // Continue without city data; user can still pick "Other"
      })
      .finally(() => {
        setCitiesLoading(false);
      });
  }, []);

  function updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function toggleMotivation(value: string) {
    setForm((prev) => ({
      ...prev,
      motivations: prev.motivations.includes(value)
        ? prev.motivations.filter((m) => m !== value)
        : [...prev.motivations, value],
    }));
    setFieldErrors((prev) => ({ ...prev, motivations_group: undefined }));
  }

  function validate(): boolean {
    const errors: typeof fieldErrors = {};

    if (!form.name.trim()) errors.name = "Nama wajib diisi";
    if (!form.city_id) errors.city_id = "Pilih kota kamu";
    if (!form.role) errors.role = "Pilih peran kamu";
    if (form.role === "Other" && !form.role_other.trim()) {
      errors.role_other = "Tolong isi peran kamu";
    }
    if (!form.company.trim()) errors.company = "Isi nama perusahaan atau organisasi";
    if (!form.whatsapp.trim()) {
      errors.whatsapp = "Nomor WhatsApp wajib diisi";
    } else if (!validateWhatsapp(form.whatsapp)) {
      errors.whatsapp = "Nomor harus diawali 08 atau +62, hanya angka";
    }
    if (form.motivations.length === 0) {
      errors.motivations_group = "Pilih minimal satu motivasi";
    }
    if (!form.referral) errors.referral = "Pilih dari mana kamu kenal VFC";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Honeypot — bots fill this field, real users never see it
    if (honeypotRef.current?.value) {
      if (generalWaLink) window.location.href = generalWaLink;
      return;
    }

    if (!validate()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        name: form.name.trim(),
        city_id: form.city_id,
        role: form.role,
        role_other: form.role_other.trim(),
        company: form.company.trim(),
        is_freelancer: form.is_freelancer,
        whatsapp: form.whatsapp.trim(),
        motivations: form.motivations,
        referral: form.referral,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await response.json()) as {
        success?: boolean;
        whatsapp_link?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      if (data.whatsapp_link) {
        window.location.href = data.whatsapp_link;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:py-20">
      {/* Page header */}
      <div className="mb-10 text-center">
        <div className="mb-5 inline-flex items-center rounded-full border border-vfc-yellow/30 bg-vfc-yellow/10 px-4 py-1.5 text-sm font-medium text-vfc-yellow">
          Community Registration
        </div>
        <h1 className="mb-4 text-3xl font-bold tracking-tight text-vfc-white md:text-4xl">
          Join Vibe From Cafe
        </h1>
        <p className="mx-auto max-w-lg text-base leading-relaxed text-vfc-muted">
          Kamu nggak sendirian menghadapi AI shift. Isi form ini buat gabung ke
          circle tech workers yang belajar, build, dan grow bareng.
        </p>
      </div>

      {/* Form card */}
      <div className="rounded-2xl border border-vfc-border bg-vfc-surface p-6 md:p-8">
        <form onSubmit={handleSubmit} noValidate className="space-y-7">
          {/* Honeypot — hidden from real users, catches bots */}
          <input
            ref={honeypotRef}
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            aria-hidden="true"
            className="absolute -left-[9999px] h-0 w-0 overflow-hidden opacity-0"
          />

          {/* 1. Full Name */}
          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium text-vfc-white">
              Full Name <span className="text-vfc-yellow">*</span>
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              value={form.name}
              onChange={(e) => updateField("name", e.target.value)}
              className={inputClass(Boolean(fieldErrors.name))}
              placeholder="Nama lengkap kamu"
            />
            {fieldErrors.name && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.name}</p>
            )}
          </div>

          {/* 2. City */}
          <div>
            <label htmlFor="city_id" className="mb-2 block text-sm font-medium text-vfc-white">
              City <span className="text-vfc-yellow">*</span>
            </label>
            {citiesLoading ? (
              <div className="flex h-12 items-center rounded-lg border border-vfc-border bg-vfc-black px-4">
                <span className="text-sm text-vfc-muted">Loading cities…</span>
              </div>
            ) : (
              <select
                id="city_id"
                required
                value={form.city_id}
                onChange={(e) => updateField("city_id", e.target.value)}
                className={selectClass(Boolean(fieldErrors.city_id), !form.city_id)}
              >
                <option value="" disabled>
                  Pilih kota kamu…
                </option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                  </option>
                ))}
                <option value={OTHER_CITY_ID}>Kota saya tidak ada di sini</option>
              </select>
            )}
            {fieldErrors.city_id && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.city_id}</p>
            )}
          </div>

          {/* 3. Role */}
          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium text-vfc-white">
              What do you do? <span className="text-vfc-yellow">*</span>
            </label>
            <select
              id="role"
              required
              value={form.role}
              onChange={(e) => updateField("role", e.target.value)}
              className={selectClass(Boolean(fieldErrors.role), !form.role)}
            >
              <option value="" disabled>
                Pilih peran kamu…
              </option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
            {fieldErrors.role && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.role}</p>
            )}
            {form.role === "Other" && (
              <div className="mt-3">
                <input
                  type="text"
                  value={form.role_other}
                  onChange={(e) => updateField("role_other", e.target.value)}
                  className={inputClass(Boolean(fieldErrors.role_other))}
                  placeholder="Please specify your role"
                />
                {fieldErrors.role_other && (
                  <p className="mt-1.5 text-xs text-red-400">{fieldErrors.role_other}</p>
                )}
              </div>
            )}
          </div>

          {/* 4. Company */}
          <div>
            <label htmlFor="company" className="mb-2 block text-sm font-medium text-vfc-white">
              Company / Where do you work? <span className="text-vfc-yellow">*</span>
            </label>
            <input
              id="company"
              type="text"
              required
              disabled={form.is_freelancer}
              value={form.company}
              onChange={(e) => updateField("company", e.target.value)}
              className={`${inputClass(Boolean(fieldErrors.company))} disabled:cursor-not-allowed disabled:opacity-50`}
              placeholder="e.g. Tokopedia, Gojek, Startup Name, Agency Name"
            />
            {fieldErrors.company && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.company}</p>
            )}
            <label className="mt-3 flex cursor-pointer items-center gap-2.5 select-none">
              <input
                type="checkbox"
                checked={form.is_freelancer}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setForm((prev) => ({
                    ...prev,
                    is_freelancer: checked,
                    company: checked ? "Freelancer / Self-employed" : "",
                  }));
                  setFieldErrors((prev) => ({ ...prev, company: undefined }));
                }}
                className="h-4 w-4 rounded accent-vfc-yellow"
              />
              <span className="text-sm text-vfc-muted">I&apos;m a Freelancer / Self-employed</span>
            </label>
          </div>

          {/* 5. WhatsApp */}
          <div>
            <label htmlFor="whatsapp" className="mb-2 block text-sm font-medium text-vfc-white">
              WhatsApp Number <span className="text-vfc-yellow">*</span>
            </label>
            <input
              id="whatsapp"
              type="tel"
              required
              autoComplete="tel"
              value={form.whatsapp}
              onChange={(e) => updateField("whatsapp", e.target.value)}
              className={inputClass(Boolean(fieldErrors.whatsapp))}
              placeholder="e.g. 08123456789"
            />
            {fieldErrors.whatsapp && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.whatsapp}</p>
            )}
          </div>

          {/* 6. Motivations */}
          <div>
            <span className="mb-1.5 block text-sm font-medium text-vfc-white">
              Motivasi gabung VFC <span className="text-vfc-yellow">*</span>
            </span>
            <p className="mb-4 text-xs text-vfc-muted">Pilih semua yang sesuai</p>
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {MOTIVATIONS.map((motivation) => {
                const checked = form.motivations.includes(motivation);
                return (
                  <label
                    key={motivation}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-all select-none ${
                      checked
                        ? "border-vfc-yellow/50 bg-vfc-yellow/5 text-vfc-white"
                        : "border-vfc-border bg-vfc-black text-vfc-muted hover:border-vfc-border hover:text-vfc-white"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleMotivation(motivation)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded accent-vfc-yellow"
                    />
                    <span className="text-sm leading-snug">{motivation}</span>
                  </label>
                );
              })}
            </div>
            {fieldErrors.motivations_group && (
              <p className="mt-2 text-xs text-red-400">{fieldErrors.motivations_group}</p>
            )}
          </div>

          {/* 7. How did you hear */}
          <div>
            <label htmlFor="referral" className="mb-2 block text-sm font-medium text-vfc-white">
              How did you hear about us? <span className="text-vfc-yellow">*</span>
            </label>
            <select
              id="referral"
              required
              value={form.referral}
              onChange={(e) => updateField("referral", e.target.value)}
              className={selectClass(Boolean(fieldErrors.referral), !form.referral)}
            >
              <option value="" disabled>
                Select an option…
              </option>
              {REFERRAL_SOURCES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            {fieldErrors.referral && (
              <p className="mt-1.5 text-xs text-red-400">{fieldErrors.referral}</p>
            )}
          </div>

          {/* Global error */}
          {error && (
            <div className="rounded-lg border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || citiesLoading}
            className="w-full rounded-xl bg-vfc-yellow py-4 text-base font-semibold text-vfc-black transition-all hover:bg-yellow-300 disabled:cursor-not-allowed disabled:opacity-50 md:py-3.5"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Submitting…
              </span>
            ) : (
              "Express Interest"
            )}
          </button>

          {/* Footer note */}
          <p className="text-center text-xs leading-relaxed text-vfc-muted">
            WhatsApp access tetap invite-only dan referral system tetap dijaga.{" "}
            This form helps us keep onboarding trusted dan relevan.
          </p>
        </form>
      </div>
    </div>
  );
}
