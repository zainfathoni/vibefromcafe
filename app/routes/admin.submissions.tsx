import { useCallback, useEffect, useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Submissions — VFC Admin" },
];

// ─── Types ────────────────────────────────────────────────────────────────────

type InvitationStatus = "signed_up" | "invited" | "approved" | "requested_to_join" | "rejected";

interface WhatsappInviteConfig {
  groupInviteUrl: string;
  messageTemplate: string;
}

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

interface StatusMeta { label: string; bg: string; text: string; border: string; needsAction: boolean; }

const STATUS_META: Record<InvitationStatus, StatusMeta> = {
  signed_up:        { label: "Signed Up",          bg: "bg-amber-900/40",  text: "text-amber-300",  border: "border-amber-500/50",  needsAction: true  },
  invited:          { label: "Invited",             bg: "bg-blue-900/40",   text: "text-blue-300",   border: "border-blue-500/50",   needsAction: false },
  requested_to_join:{ label: "Requested to Join",   bg: "bg-purple-900/40", text: "text-purple-300", border: "border-purple-500/50", needsAction: true  },
  approved:         { label: "Approved",            bg: "bg-green-900/40",  text: "text-green-300",  border: "border-green-500/50",  needsAction: false },
  rejected:         { label: "Rejected",            bg: "bg-red-900/40",    text: "text-red-300",    border: "border-red-500/50",    needsAction: false },
};

const STATUS_OPTIONS = Object.keys(STATUS_META) as InvitationStatus[];
const NEEDS_ACTION_STATUSES = STATUS_OPTIONS.filter((s) => STATUS_META[s].needsAction);

type StatusFilter = InvitationStatus | "all" | "needs_action";

const STATUS_FILTER_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: "all",          label: "All" },
  { value: "needs_action", label: "🔔 Needs Action" },
  ...STATUS_OPTIONS.map((s) => ({ value: s as StatusFilter, label: STATUS_META[s].label })),
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_WA_TEMPLATE = "Hi {{name}}, welcome to Vibe From Cafe. Join our WhatsApp community here: {{group_link}}";

const REFERRAL_LABELS: Record<string, string> = {
  friend: "A friend", instagram: "Instagram", threads: "Threads",
  twitter: "X (Twitter)", github: "GitHub", other: "Other",
};

function formatLabel(value: string) {
  return value.split(/[-_ ]+/).filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1)).join(" ");
}

function formatReferralSource(source: string) {
  return REFERRAL_LABELS[source] ?? formatLabel(source);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" });
}

function formatAudit(by?: string, at?: string) {
  if (!by && !at) return "-";
  return at ? `${by ?? "admin"} • ${formatDate(at)}` : (by ?? "admin");
}

function normalizeStatus(s?: InvitationStatus | null): InvitationStatus { return s ?? "signed_up"; }

function normalizePhone(v?: string) {
  const d = (v ?? "").replace(/\D/g, "");
  if (!d) return "";
  if (d.startsWith("0")) return `62${d.slice(1)}`;
  if (d.startsWith("8")) return `62${d}`;
  return d;
}

function buildInviteUrl(submission: Submission, cfg: WhatsappInviteConfig) {
  const phone = normalizePhone(submission.whatsapp);
  const groupUrl = cfg.groupInviteUrl.trim();
  if (!phone || !groupUrl) return null;
  const tpl = cfg.messageTemplate;
  const hasToken = tpl.includes("{{group_link}}");
  let msg = tpl
    .replaceAll("{{name}}", submission.name)
    .replaceAll("{{phone}}", submission.whatsapp)
    .replaceAll("{{group_link}}", groupUrl);
  if (!hasToken) msg = `${msg}\n${groupUrl}`;
  const clean = msg.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu, "").replace(/ {2,}/g, " ").trim();
  return `https://wa.me/${phone}?text=${encodeURIComponent(clean)}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: InvitationStatus }) {
  const m = STATUS_META[status] ?? STATUS_META.signed_up;
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${m.bg} ${m.text} ${m.border}`}>
      {m.label}
    </span>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminSubmissions() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [waCfg, setWaCfg] = useState<WhatsappInviteConfig>({
    groupInviteUrl: "",
    messageTemplate: DEFAULT_WA_TEMPLATE,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [updatingById, setUpdatingById] = useState<Record<string, boolean>>({});

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

  const filtered = submissions.filter((s) => {
    const st = normalizeStatus(s.invitationStatus);
    if (statusFilter === "all") return true;
    if (statusFilter === "needs_action") return NEEDS_ACTION_STATUSES.includes(st);
    return st === statusFilter;
  });

  const counts = submissions.reduce<Record<string, number>>((acc, s) => {
    const st = normalizeStatus(s.invitationStatus);
    acc[st] = (acc[st] ?? 0) + 1;
    return acc;
  }, {});
  const needsActionCount = submissions.filter((s) => NEEDS_ACTION_STATUSES.includes(normalizeStatus(s.invitationStatus))).length;

  return (
    <div className="p-6 md:p-8">
      {/* Header */}
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-vfc-white">Submissions</h1>
          <p className="mt-1 text-sm text-vfc-muted">
            Review member applications and move them through the invitation pipeline.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex cursor-pointer items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      {/* Status filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        {STATUS_FILTER_OPTIONS.map((opt) => {
          const active = statusFilter === opt.value;
          const count = opt.value === "all" ? submissions.length
            : opt.value === "needs_action" ? needsActionCount
            : (counts[opt.value] ?? 0);
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => setStatusFilter(opt.value)}
              className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                active
                  ? "border-vfc-yellow bg-vfc-yellow/15 text-vfc-yellow"
                  : "border-vfc-border bg-vfc-surface text-vfc-muted hover:border-vfc-yellow/50 hover:text-vfc-white"
              }`}
            >
              {opt.label}
              <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold leading-none ${active ? "bg-vfc-yellow/25 text-vfc-yellow" : "bg-vfc-border text-vfc-muted"}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
        <div className="flex items-center justify-between border-b border-vfc-border px-5 py-3 text-sm text-vfc-muted">
          <span>{statusFilter === "all" ? "Total submissions" : "Showing"}</span>
          <span className="font-semibold text-vfc-white">
            {statusFilter === "all" ? submissions.length : `${filtered.length} of ${submissions.length}`}
          </span>
        </div>

        {!waCfg.groupInviteUrl && (
          <div className="border-b border-vfc-border px-5 py-3 text-sm text-amber-300">
            Set <code>WHATSAPP_GROUP_INVITE_URL</code> to enable one-click WhatsApp invites.
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead className="bg-vfc-black/50 text-xs uppercase tracking-wide text-vfc-muted">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">City</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Company</th>
                <th className="px-5 py-3 font-medium">WhatsApp</th>
                <th className="px-5 py-3 font-medium">Motivations</th>
                <th className="px-5 py-3 font-medium">How Heard</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Invited</th>
                <th className="px-5 py-3 font-medium">Approved</th>
                <th className="px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td className="px-5 py-8 text-vfc-muted" colSpan={11}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td className="px-5 py-8 text-vfc-muted" colSpan={11}>
                    {submissions.length === 0 ? "No submissions found." : "No submissions match the selected filter."}
                  </td>
                </tr>
              ) : filtered.map((s) => {
                const updating = Boolean(updatingById[s.id]);
                const inviteUrl = buildInviteUrl(s, waCfg);
                const roleLabel = s.role_other ? `${s.role} — ${s.role_other}` : s.role;
                const howHeard = s.referral
                  ? formatReferralSource(s.referral)
                  : s.referralSource
                    ? [formatReferralSource(s.referralSource), s.referralName].filter(Boolean).join(" · ")
                    : "-";
                const allowedStatuses = s.allowedNextStatuses ?? STATUS_OPTIONS;

                return (
                  <tr key={s.id} className="border-t border-vfc-border/60 align-top transition-colors hover:bg-vfc-black/20">
                    <td className="px-5 py-3.5 font-medium text-vfc-white">{s.name}</td>
                    <td className="px-5 py-3.5 text-vfc-white/90">{s.city || "-"}</td>
                    <td className="px-5 py-3.5 text-vfc-white/90">{roleLabel || "-"}</td>
                    <td className="px-5 py-3.5 text-vfc-white/90">
                      {s.company ? (
                        <>
                          {s.company}
                          {s.is_freelancer && <span className="ml-1.5 text-xs text-vfc-muted">(freelance)</span>}
                        </>
                      ) : "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.whatsapp && inviteUrl ? (
                        <a
                          href={inviteUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => {
                            const next = getNextStatusOnWaClick(s);
                            if (next) void updateStatus(s.id, next, { keepalive: true });
                          }}
                          className="text-vfc-yellow hover:underline"
                        >
                          {s.whatsapp}
                        </a>
                      ) : s.whatsapp || "-"}
                    </td>
                    <td className="px-5 py-3.5">
                      {s.motivations?.length ? (
                        <div className="flex max-w-[200px] flex-wrap gap-1">
                          {s.motivations.map((m) => (
                            <span key={m} className="rounded-full border border-vfc-border bg-vfc-black px-2 py-0.5 text-[11px] text-vfc-muted">
                              {m}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-vfc-muted">-</span>}
                    </td>
                    <td className="px-5 py-3.5 text-vfc-white/90">{howHeard}</td>
                    <td className="px-5 py-3.5">
                      <div className="flex flex-col gap-2">
                        <StatusBadge status={normalizeStatus(s.invitationStatus)} />
                        <select
                          value={normalizeStatus(s.invitationStatus)}
                          disabled={updating}
                          onChange={(e) => void updateStatus(s.id, e.target.value as InvitationStatus)}
                          className="rounded-md border border-vfc-border bg-vfc-black px-2.5 py-1.5 text-xs text-vfc-white outline-none transition-colors focus:border-vfc-yellow disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {allowedStatuses.map((st) => (
                            <option key={st} value={st}>{STATUS_META[st]?.label ?? formatLabel(st)}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-vfc-white/70">{formatAudit(s.invited_by, s.invited_at)}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-vfc-white/70">{formatAudit(s.approved_by, s.approved_at)}</td>
                    <td className="whitespace-nowrap px-5 py-3.5 text-xs text-vfc-white/70">{formatDate(s.createdAt)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
