import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router";
import type { MetaFunction } from "react-router";
import type { Event } from "../data/types";

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

interface EventsResponse {
  events?: Event[];
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

function formatEventSchedule(event: Event) {
  const date = new Date(`${event.date}T00:00:00`);
  const readableDate = Number.isNaN(date.getTime())
    ? event.date
    : date.toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

  return `${readableDate} • ${event.time}`;
}

export default function Admin() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [submissionsLoading, setSubmissionsLoading] = useState(true);
  const [submissionsError, setSubmissionsError] = useState<string | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventsError, setEventsError] = useState<string | null>(null);
  const [updatingById, setUpdatingById] = useState<Record<string, boolean>>({});

  const loadSubmissions = useCallback(async () => {
    setSubmissionsLoading(true);
    setSubmissionsError(null);

    try {
      const response = await fetch("/api/admin/submissions");
      const data = (await response.json()) as SubmissionsResponse;

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to load submissions");
      }

      setSubmissions(data.submissions ?? []);
    } catch (err) {
      setSubmissionsError(err instanceof Error ? err.message : "Failed to load submissions");
    } finally {
      setSubmissionsLoading(false);
    }
  }, []);

  const loadEvents = useCallback(async () => {
    setEventsLoading(true);
    setEventsError(null);

    try {
      const response = await fetch("/api/admin/events");
      const data = (await response.json()) as EventsResponse;

      if (!response.ok) {
        throw new Error(
          data.error ? `Failed to load events: ${data.error}` : "Failed to load events",
        );
      }

      setEvents(data.events ?? []);
    } catch (err) {
      setEventsError(err instanceof Error ? err.message : "Failed to load events");
    } finally {
      setEventsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSubmissions();
    void loadEvents();
  }, [loadEvents, loadSubmissions]);

  async function updateInvitationStatus(id: string, invitationStatus: InvitationStatus) {
    setSubmissionsError(null);
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
      setSubmissionsError(err instanceof Error ? err.message : "Failed to update invitation status");
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
          disabled={submissionsLoading}
          className="inline-flex cursor-pointer items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submissionsLoading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {submissionsError && (
        <div className="mb-6 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
          {submissionsError}
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
              {submissionsLoading ? (
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

      <section className="mt-10">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-vfc-white">Events Management</h2>
            <p className="mt-1 text-sm text-vfc-muted">Publish new events and edit existing schedules shown on the public events page.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void loadEvents()}
              disabled={eventsLoading}
              className="inline-flex cursor-pointer items-center rounded-lg border border-vfc-border bg-vfc-surface px-4 py-2 text-sm font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow disabled:cursor-not-allowed disabled:opacity-60"
            >
              {eventsLoading ? "Refreshing…" : "Refresh"}
            </button>
            <Link
              to="/admin/events/new"
              className="inline-flex items-center rounded-lg bg-vfc-yellow px-4 py-2 text-sm font-semibold text-vfc-black transition-colors hover:bg-yellow-300"
            >
              New Event
            </Link>
          </div>
        </div>

        {eventsError && (
          <div className="mb-6 rounded-lg border border-red-400/40 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {eventsError}
          </div>
        )}

        <div className="rounded-2xl border border-vfc-border bg-vfc-surface">
          <div className="flex items-center justify-between border-b border-vfc-border px-4 py-3 text-sm text-vfc-muted">
            <span>Total events</span>
            <span className="font-semibold text-vfc-white">{events.length}</span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[860px] w-full text-left text-sm">
              <thead className="bg-vfc-black/70 text-xs uppercase tracking-wide text-vfc-muted">
                <tr>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">Schedule</th>
                  <th className="px-4 py-3 font-medium">Location</th>
                  <th className="px-4 py-3 font-medium">Tags</th>
                  <th className="px-4 py-3 font-medium">Created At</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {eventsLoading ? (
                  <tr>
                    <td className="px-4 py-6 text-vfc-muted" colSpan={6}>
                      Loading events…
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td className="px-4 py-6 text-vfc-muted" colSpan={6}>
                      No events found.
                    </td>
                  </tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="border-t border-vfc-border/70 align-top">
                      <td className="px-4 py-3 font-medium text-vfc-white">{event.title}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{formatEventSchedule(event)}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{event.location}</td>
                      <td className="px-4 py-3 text-vfc-white/90">{event.tags.length > 0 ? event.tags.join(", ") : "-"}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-vfc-white/80">{formatSubmittedAt(event.createdAt)}</td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/admin/events/${event.id}/edit`}
                          className="inline-flex items-center rounded-md border border-vfc-border px-3 py-1.5 text-xs font-medium text-vfc-white transition-colors hover:border-vfc-yellow hover:text-vfc-yellow"
                        >
                          Edit
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
