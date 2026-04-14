import { useCallback, useEffect, useState } from "react";
import type { ReactNode } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [{ title: "Submissions — VFC Admin" }];

// ─── Types ────────────────────────────────────────────────────────────────────

type InvitationStatus = "signed_up" | "invited" | "approved" | "requested_to_join" | "rejected";

interface WhatsappInviteConfig { groupInviteUrl: string; messageTemplate: string; }

interface Submission {
  id: string;
  name: string;
  city: string;
  city_id?: string;
  role: string;
  role_other?: string;
  company?: string;
  is_freelancer?: boolean;
  whatsapp: string;
  motivations?: string[];
  referral?: string;
  referralSource?: string;
  referralName?: string;
  invitationStatus: InvitationStatus;
  allowedNextStatuses?: InvitationStatus[];
  invited_by?: string;
  invited_at?: string;
  approved_by?: string;
  approved_at?: string;
  createdAt: string;
}

interface SubmissionsResponse {
  submissions?: Submission[];
  whatsappInvite?: Partial<WhatsappInviteConfig>;
  error?: string;
}

interface UpdateSubmissionResponse {
  submission?: Submission;
  error?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

interface StatusMeta { label: string; dot: string; bg: string; text: string; border: string; needsAction: boolean; }

const STATUS_META: Record<InvitationStatus, StatusMeta> = {
  signed_up:         { label: "Signed Up",        dot: "bg-amber-400",   bg: "bg-amber-900/30",  text: "text-amber-300",  border: "border-amber-500/40",  needsAction: true  },
  invited:           { label: "Invited",           dot: "bg-blue-400",    bg: "bg-blue-900/30",   text: "text-blue-300",   border: "border-blue-500/40",   needsAction: false },
  requested_to_join: { label: "Requested",         dot: "bg-purple-400",  bg: "bg-purple-900/30", text: "text-purple-300", border: "border-purple-500/40", needsAction: true  },
  approved:          { label: "Approved",          dot: "bg-emerald-400", bg: "bg-emerald-900/30",text: "text-emerald-300",border: "border-emerald-500/40",needsAction: false },
  rejected:          { label: "Rejected",          dot: "bg-red-500",     bg: "bg-red-900/30",    text: "text-red-300",    border: "border-red-500/40",    needsAction: false },
};

const STATUS_OPTIONS = Object.keys(STATUS_META) as InvitationStatus[];
const NEEDS_ACTION_STATUSES = STATUS_OPTIONS.filter((s) => STATUS_META[s].needsAction);

type StatusFilter = InvitationStatus | "all" | "needs_action";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "needs_action", label: "Needs Action" },
  ...STATUS_OPTIONS.map((s) => ({ value: s as StatusFilter, label: STATUS_META[s].label })),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_WA_TEMPLATE = "Hi {{name}}, welcome to Vibe From Cafe. Join our WhatsApp community here: {{group_link}}";

const REFERRAL_LABELS: Record<string, string> = {
  friend: "A friend", instagram: "Instagram", threads: "Threads",
  twitter: "X (Twitter)", github: "GitHub", other: "Other",
};

function formatLabel(v: string) {
  return v.split(/[-_ ]+/).filter(Boolean).map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}
function formatReferralSource(s: string) { return REFERRAL_LABELS[s] ?? formatLabel(s); }
function normalizeStatus(s?: InvitationStatus | null): InvitationStatus { return s ?? "signed_up"; }

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 30) return `${d}d ago`;
  const mo = Math.floor(d / 30);
  return mo < 12 ? `${mo}mo ago` : `${Math.floor(mo / 12)}y ago`;
}

function formatAudit(by?: string, at?: string) {
  if (!by && !at) return "-";
  return at ? `${by ?? "admin"} • ${formatDate(at)}` : (by ?? "admin");
}

function normalizePhone(v?: string) {
  const d = (v ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) return `62${d.slice(1)}`;
  if (d.startsWith("8")) return `62${d}`;
  return d;
}

function buildInviteUrl(s: Submission, cfg: WhatsappInviteConfig) {
  const phone = normalizePhone(s.whatsapp);
  const groupUrl = cfg.groupInviteUrl.trim();
  if (!phone || !groupUrl) return null;
  const tpl = cfg.messageTemplate;
  const hasToken = tpl.includes("{{group_link}}");
  let msg = tpl.replaceAll("{{name}}", s.name).replaceAll("{{phone}}", s.whatsapp).replaceAll("{{group_link}}", groupUrl);
  if (!hasToken) msg = `${msg}\n${groupUrl}`;
  const clean = msg.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").replace(/ {2,}/g, " ").trim();
  return `https://wa.me/${phone}?text=${encodeURIComponent(clean)}`;
}

const AVATAR_COLORS = [
  "bg-blue-900/70 text-blue-300",
  "bg-violet-900/70 text-violet-300",
  "bg-emerald-900/70 text-emerald-300",
  "bg-rose-900/70 text-rose-300",
  "bg-amber-900/70 text-amber-300",
  "bg-cyan-900/70 text-cyan-300",
  "bg-pink-900/70 text-pink-300",
  "bg-orange-900/70 text-orange-300",
];

function avatarColor(name: string) {
  const hash = name.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((w) => w[0] ?? "").join("").toUpperCase();
}

// ─── Member detail modal ──────────────────────────────────────────────────────

function DetailRow({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="mb-0.5 text-[10px] font-semibold uppercase tracking-widest text-vfc-muted">{label}</dt>
      <dd className="text-sm text-vfc-white">{value || <span className="text-vfc-muted">—</span>}</dd>
    </div>
  );
}

function MemberModal({ member, onClose }: { member: Submission; onClose: () => void }) {
  const sm = STATUS_META[normalizeStatus(member.invitationStatus)];
  const roleLabel = member.role_other ? `${member.role} — ${member.role_other}` : member.role;
  const referralLabel = member.referral
    ? formatReferralSource(member.referral)
    : member.referralSource
      ? [formatReferralSource(member.referralSource), member.referralName].filter(Boolean).join(" · ")
      : null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 p-4 sm:items-center" onClick={onClose}>
      <div
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-2xl border border-vfc-border bg-vfc-surface shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start gap-4 border-b border-vfc-border px-6 py-5">
          <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-sm font-bold ${avatarColor(member.name)}`}>
            {initials(member.name)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="truncate text-lg font-bold text-vfc-white">{member.name}</h2>
            <div className="mt-1 flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sm.bg} ${sm.text} ${sm.border}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                {sm.label}
              </span>
              {member.city && <span className="text-xs text-vfc-muted">{member.city}</span>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-vfc-muted transition-colors hover:bg-vfc-black/60 hover:text-vfc-white"
            aria-label="Close"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Details grid */}
        <dl className="grid grid-cols-2 gap-x-8 gap-y-5 px-6 py-6">
          <DetailRow label="Role" value={roleLabel} />
          <DetailRow label="Company" value={
            member.company
              ? <>{member.company}{member.is_freelancer && <span className="ml-1.5 text-xs text-vfc-muted">(freelance)</span>}</>
              : null
          } />
          <DetailRow label="WhatsApp" value={
            member.whatsapp
              ? <a href={`https://wa.me/${normalizePhone(member.whatsapp)}`} target="_blank" rel="noopener noreferrer" className="text-vfc-yellow hover:underline">{member.whatsapp}</a>
              : null
          } />
          <DetailRow label="How Heard" value={referralLabel} />
          <DetailRow label="Submitted" value={formatDate(member.createdAt)} />
          {(member.invited_by || member.approved_by) && (
            <DetailRow label={member.approved_by ? "Approved by" : "Invited by"} value={
              member.approved_by
                ? formatAudit(member.approved_by, member.approved_at)
                : formatAudit(member.invited_by, member.invited_at)
            } />
          )}
        </dl>

        {/* Motivations */}
        {member.motivations?.length ? (
          <div className="border-t border-vfc-border px-6 py-5">
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-vfc-muted">Motivations</p>
            <div className="flex flex-wrap gap-1.5">
              {member.motivations.map((m) => (
                <span key={m} className="rounded-full border border-vfc-border bg-vfc-black px-3 py-1 text-xs text-vfc-white/80">
                  {m}
                </span>
              ))}
            </div>
          </div>
        ) : null}

        {/* Footer */}
        <div className="border-t border-vfc-border px-6 py-3.5">
          <p className="font-mono text-[10px] text-vfc-muted/60">ID: {member.id}</p>
        </div>
      </div>
    </div>
  );
}

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-xl border px-5 py-4 ${accent ? "border-vfc-yellow/30 bg-vfc-yellow/5" : "border-vfc-border bg-vfc-surface"}`}>
      <p className={`text-2xl font-bold tabular-nums ${accent ? "text-vfc-yellow" : "text-vfc-white"}`}>{value}</p>
      <p className="mt-0.5 text-xs text-vfc-muted">{label}</p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [waCfg, setWaCfg] = useState<WhatsappInviteConfig>({ groupInviteUrl: "", messageTemplate: DEFAULT_WA_TEMPLATE });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [updatingById, setUpdatingById] = useState<Record<string, boolean>>({});
  const [viewMember, setViewMember] = useState<Submission | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/submissions");
      const data = (await res.json()) as SubmissionsResponse;
      if (!res.ok) throw new Error(data.error ?? "Failed to load");
      setSubmissions(data.submissions ?? []);
      setWaCfg({
        groupInviteUrl: data.whatsappInvite?.groupInviteUrl?.trim() ?? "",
        messageTemplate: data.whatsappInvite?.messageTemplate?.trim() || DEFAULT_WA_TEMPLATE,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function updateStatus(id: string, invitationStatus: InvitationStatus, opts?: { keepalive?: boolean }) {
    setError(null);
    setUpdatingById((c) => ({ ...c, [id]: true }));
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        keepalive: opts?.keepalive,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationStatus }),
      });
      const data = (await res.json()) as UpdateSubmissionResponse;
      if (!res.ok) throw new Error(data.error ?? "Failed to update");
      setSubmissions((c) => c.map((s) => s.id === id ? (data.submission ?? { ...s, invitationStatus }) : s));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update");
    } finally {
      setUpdatingById((c) => { const n = { ...c }; delete n[id]; return n; });
    }
  }

  function getNextStatusOnWaClick(s: Submission): InvitationStatus | null {
    const cur = normalizeStatus(s.invitationStatus);
    if (cur === "signed_up") return "invited";
    if (cur === "invited") return "requested_to_join";
    if (cur === "requested_to_join") return "approved";
    return null;
  }

  // Stats
  const approvedCount   = submissions.filter((s) => normalizeStatus(s.invitationStatus) === "approved").length;
  const needsActionCount = submissions.filter((s) => NEEDS_ACTION_STATUSES.includes(normalizeStatus(s.invitationStatus))).length;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeekCount = submissions.filter((s) => new Date(s.createdAt).getTime() > weekAgo).length;

  // Filter + search
  const counts = submissions.reduce<Record<string, number>>((acc, s) => {
    const st = normalizeStatus(s.invitationStatus);
    acc[st] = (acc[st] ?? 0) + 1;
    return acc;
  }, {});

  const q = search.trim().toLowerCase();
  const filtered = submissions.filter((s) => {
    const st = normalizeStatus(s.invitationStatus);
    const matchesFilter =
      statusFilter === "all" ? true
      : statusFilter === "needs_action" ? NEEDS_ACTION_STATUSES.includes(st)
      : st === statusFilter;
    if (!matchesFilter) return false;
    if (!q) return true;
    return (
      s.name.toLowerCase().includes(q) ||
      s.city?.toLowerCase().includes(q) ||
      s.role?.toLowerCase().includes(q) ||
      s.company?.toLowerCase().includes(q) ||
      s.whatsapp?.includes(q)
    );
  });

  return (
    <div className="p-6 md:p-8">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-vfc-white">Submissions</h1>
          <p className="mt-1 text-sm text-vfc-muted">Manage community member applications.</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-vfc-border px-4 py-2 text-sm font-medium text-vfc-muted transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-50"
        >
          <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────── */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Total members"  value={submissions.length} />
        <StatCard label="Approved"       value={approvedCount}      accent />
        <StatCard label="Needs action"   value={needsActionCount}   />
        <StatCard label="This week"      value={thisWeekCount}      />
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-950/30 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {/* ── Search + Filters ───────────────────────────────── */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative">
          <svg className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-vfc-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search name, city, role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-52 rounded-lg border border-vfc-border bg-vfc-black py-2 pl-8 pr-3 text-sm text-vfc-white outline-none transition-colors placeholder:text-vfc-muted focus:border-vfc-yellow"
          />
        </div>

        {/* Filter chips */}
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTER_OPTIONS.map((opt) => {
            const active = statusFilter === opt.value;
            const count = opt.value === "all" ? submissions.length
              : opt.value === "needs_action" ? needsActionCount
              : (counts[opt.value] ?? 0);
            const sm = opt.value !== "all" && opt.value !== "needs_action" ? STATUS_META[opt.value as InvitationStatus] : null;
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={active}
                onClick={() => setStatusFilter(opt.value)}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? sm
                      ? `${sm.border} ${sm.bg} ${sm.text}`
                      : "border-vfc-yellow/50 bg-vfc-yellow/10 text-vfc-yellow"
                    : "border-vfc-border text-vfc-muted hover:border-vfc-border hover:text-vfc-white"
                }`}
              >
                {sm && active && <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />}
                {opt.value === "needs_action" && <span>🔔</span>}
                {opt.label}
                <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none tabular-nums ${active ? "bg-white/10" : "bg-vfc-border text-vfc-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-vfc-border">
        {/* Summary row */}
        <div className="flex items-center justify-between border-b border-vfc-border bg-vfc-surface px-5 py-3">
          <span className="text-xs text-vfc-muted">
            {statusFilter === "all" && !q
              ? `${submissions.length} members total`
              : `${filtered.length} of ${submissions.length} shown`}
          </span>
          {!waCfg.groupInviteUrl && (
            <span className="text-xs text-amber-400/80">
              Set <code className="font-mono">WHATSAPP_GROUP_INVITE_URL</code> for one-click invites
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-vfc-border bg-vfc-black/40">
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-vfc-muted">Member</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-vfc-muted">Role</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-vfc-muted">WhatsApp</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-vfc-muted">Status</th>
                <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-vfc-muted">Joined</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="bg-vfc-surface">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-vfc-muted">
                    <svg className="mx-auto mb-2 h-5 w-5 animate-spin text-vfc-muted" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading submissions…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-12 text-center">
                    <p className="text-sm font-medium text-vfc-white">
                      {submissions.length === 0 ? "No submissions found." : "No submissions match the selected filter."}
                    </p>
                    {(q || statusFilter !== "all") && (
                      <button
                        type="button"
                        onClick={() => { setSearch(""); setStatusFilter("all"); }}
                        className="mt-2 text-xs text-vfc-yellow hover:underline"
                      >
                        Clear filters
                      </button>
                    )}
                  </td>
                </tr>
              ) : filtered.map((s) => {
                const updating = Boolean(updatingById[s.id]);
                const inviteUrl = buildInviteUrl(s, waCfg);
                const roleLabel = s.role_other ? `${s.role} — ${s.role_other}` : s.role;
                const sm = STATUS_META[normalizeStatus(s.invitationStatus)];
                const allowedStatuses = s.allowedNextStatuses ?? STATUS_OPTIONS;

                return (
                  <tr
                    key={s.id}
                    className="group border-t border-vfc-border/50 transition-colors hover:bg-vfc-black/30"
                  >
                    {/* Member */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${avatarColor(s.name)}`}>
                          {initials(s.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-vfc-white">{s.name}</p>
                          {s.city && <p className="text-xs text-vfc-muted">{s.city}</p>}
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-5 py-3.5">
                      <p className="text-vfc-white/90">{roleLabel || "-"}</p>
                      {s.company && (
                        <p className="text-xs text-vfc-muted">
                          {s.company}
                          {s.is_freelancer && " · freelance"}
                        </p>
                      )}
                    </td>

                    {/* WhatsApp */}
                    <td className="px-5 py-3.5">
                      {s.whatsapp ? (
                        inviteUrl ? (
                          <a
                            href={inviteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => {
                              const next = getNextStatusOnWaClick(s);
                              if (next) void updateStatus(s.id, next, { keepalive: true });
                            }}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-vfc-border px-2.5 py-1 text-xs font-medium text-vfc-white transition-colors hover:border-emerald-500/50 hover:bg-emerald-950/30 hover:text-emerald-300"
                          >
                            <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                            </svg>
                            {s.whatsapp}
                          </a>
                        ) : (
                          <span className="text-vfc-white/80">{s.whatsapp}</span>
                        )
                      ) : (
                        <span className="text-vfc-muted">-</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-1.5">
                        <span className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${sm.bg} ${sm.text} ${sm.border}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${sm.dot}`} />
                          {sm.label}
                        </span>
                        <select
                          value={normalizeStatus(s.invitationStatus)}
                          disabled={updating}
                          onChange={(e) => void updateStatus(s.id, e.target.value as InvitationStatus)}
                          className="w-fit rounded-md border border-vfc-border bg-vfc-black/60 py-1 pl-2 pr-6 text-[11px] text-vfc-muted outline-none transition-colors focus:border-vfc-yellow disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {allowedStatuses.map((st) => (
                            <option key={st} value={st}>{STATUS_META[st]?.label ?? formatLabel(st)}</option>
                          ))}
                        </select>
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5">
                      <p className="text-sm text-vfc-white/80">{timeAgo(s.createdAt)}</p>
                      <p className="text-[11px] text-vfc-muted">{formatDate(s.createdAt).split(",")[0]}</p>
                    </td>

                    {/* View */}
                    <td className="px-4 py-3.5">
                      <button
                        type="button"
                        onClick={() => setViewMember(s)}
                        className="rounded-lg border border-vfc-border px-3 py-1.5 text-xs font-medium text-vfc-muted opacity-0 transition-all group-hover:opacity-100 hover:border-vfc-yellow hover:text-vfc-yellow"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {viewMember && <MemberModal member={viewMember} onClose={() => setViewMember(null)} />}
    </div>
  );
}
