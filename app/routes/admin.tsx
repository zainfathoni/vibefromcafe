import { useCallback, useEffect, useState } from "react";
import type { MetaFunction } from "react-router";

export const meta: MetaFunction = () => [
  { title: "Admin — Vibe From Cafe" },
  {
    name: "description",
    content: "Admin dashboard to review and update Vibe From Cafe community submissions.",
  },
];

type InvitationStatus = "pending" | "invited" | "joined" | "declined";

interface Submission {
  id: string;
  name: string;
  city: string;
  role: string;
  whatsapp: string;
  referralSource: string;
  referralName?: string;
  invitationStatus: InvitationStatus;
  createdAt: string;
}

interface SubmissionsResponse {
  submissions?: Submission[];
  error?: string;
}

interface UpdateSubmissionResponse {
  submission?: Submission;
  error?: string;
}

const STATUS_OPTIONS: InvitationStatus[] = ["pending", "invited", "joined", "declined"];

const REFERRAL_SOURCE_LABELS: Record<string, string> = {
  friend: "A friend",
  instagram: "Instagram",
  twitter: "X (Twitter)",
  github: "GitHub",
  other: "Other",
};

function formatLabel(value: string) {
  return value
    .split(/[-_ ]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatReferralSource(source: string) {
  return REFERRAL_SOURCE_LABELS[source] ?? formatLabel(source);
}

function formatSubmittedAt(createdAt: string) {
  const parsed = new Date(createdAt);
  if (Number.isNaN(parsed.getTime())) {
    return createdAt;
  }

  return parsed.toLocaleString("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingById, setUpdatingById] = useState<Record<string, boolean>>({});

  const loadSubmissions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/submissions");
      const data = (await response.json()) as SubmissionsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load submissions");
      }

      setSubmissions(data.submissions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions();
  }, [loadSubmissions]);

  async function updateInvitationStatus(id: string, invitationStatus: InvitationStatus) {
    setError(null);
    setUpdatingById((current) => ({ ...current, [id]: true }));

    try {
      const response = await fetch(`/api/admin/submissions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationStatus }),
      });

      const data = (await response.json()) as UpdateSubmissionResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to update invitation status");
      }

      setSubmissions((current) =>
        current.map((submission) =>
          submission.id === id
            ? data.submission ?? { ...submission, invitationStatus }
            : submission,
        ),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update invitation status");
    } finally {
      setUpdatingById((current) => {
        const next = { ...current };
        delete next[id];
        return next;
      });
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 md:py-14">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-vfc-white">Submissions Admin</h1>
          <p className="mt-2 text-sm text-vfc-muted">
            Review member applications and move each one through the invitation pipeline.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadSubmissions()}
          disabled={loading}
          className="inline-flex items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-6 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
        <div className="flex items-center justify-between border-b border-vfc-border px-4 py-3 text-sm text-vfc-muted">
          <span>Total submissions</span>
          <span className="font-semibold text-vfc-white">{submissions.length}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[980px] w-full text-left text-sm">
            <thead className="bg-vfc-black/70 text-xs uppercase tracking-wide text-vfc-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">City</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">WhatsApp</th>
                <th className="px-4 py-3 font-medium">Referral Source</th>
                <th className="px-4 py-3 font-medium">Referral Name</th>
                <th className="px-4 py-3 font-medium">Invitation Status</th>
                <th className="px-4 py-3 font-medium">Submitted At</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td className="px-4 py-6 text-vfc-muted" colSpan={8}>
                    Loading submissions…
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td className="px-4 py-6 text-vfc-muted" colSpan={8}>
                    No submissions found.
                  </td>
                </tr>
              ) : (
                submissions.map((submission) => {
                  const isUpdating = Boolean(updatingById[submission.id]);

                  return (
                    <tr key={submission.id} className="border-t border-vfc-border/70 align-top">
                      <td className="px-4 py-3 font-medium text-vfc-white">{submission.name}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{submission.city}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{submission.role}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{submission.whatsapp || "-"}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{submission.referralSource ? formatReferralSource(submission.referralSource) : "-"}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{submission.referralName || "-"}</td>
                      <td className="px-4 py-3">
                        <select
                          value={submission.invitationStatus ?? "pending"}
                          onChange={(event) =>
                            void updateInvitationStatus(
                              submission.id,
                              event.target.value as InvitationStatus,
                            )
                          }
                          disabled={isUpdating}
                          className="min-w-32 rounded-md border border-vfc-border bg-vfc-black px-3 py-1.5 text-vfc-white outline-none transition-colors focus:border-vfc-yellow disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {formatLabel(status)}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-vfc-white/80">
                        {formatSubmittedAt(submission.createdAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
