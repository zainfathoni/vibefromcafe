# Ralph Loop Prompt

You are working inside `/Users/zain/Code/GitHub/zainfathoni/vibefromcafe`.

Your issue tracker is repo-local `tk`, not GitHub issues.

Migration source of truth:

- `__RALPH_PLAN_PATH__`

Migration scope:

- epic: `__RALPH_EPIC_ID__`

Execution contract for this single run:

1. Read the migration plan if you need context.
2. Before running any app-level verification or tests that need the dev server, check whether a suitable dev server is already running and reuse it if available; only start a new server if none is running.
3. Inspect the current backlog state first:
   - `tk show __RALPH_EPIC_ID__`
   - `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__`
4. Treat only descendant tickets of `__RALPH_EPIC_ID__` as matching already-claimed work; do not treat the epic `__RALPH_EPIC_ID__` itself as resumable issue work.
5. If exactly one matching descendant ticket is already `in_progress`, resume that ticket instead of selecting new work.
6. If more than one matching descendant ticket is already `in_progress`, do not pick new work. Leave a clear `tk add-note` on the epic describing the conflict and stop.
7. If no matching ticket is `in_progress`, use the `ready_ids` from `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__` to determine ready work.
8. If the summary reports no open or in-progress descendants left under this epic, print exactly `<status>COMPLETE</status>` on its own line and stop.
9. Otherwise, pick exactly one ready ticket from this migration backlog.
10. Only pick a ticket that appears in the current `ready_ids` output. Do not pick blocked, already in-progress, or merely open tickets that are not in the ready set.
11. Immediately before claiming the ticket, re-run `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__` and confirm the same ticket is still ready.
12. Mark it `in_progress` before making changes with `tk start <id>`.
13. Implement the smallest correct change needed for that ticket.
14. Run relevant verification for the ticket.
15. If the ticket is successfully completed, create a git commit before closing it.
16. The commit message must include the ticket ID so the work stays traceable.
17. For a successful completion, add a `tk add-note <id>` entry describing what changed, what was verified, and the commit hash, then close the ticket with `tk close <id>`.
18. If the ticket is not complete, leave it open or `in_progress` and add a clear `tk add-note` describing the blocker, what you tried, and what must happen next.

Working rules:

- Only work on tickets in this migration backlog.
- Resume an existing `in_progress` descendant before looking for new ready work.
- For the in-progress check, match only descendant tickets of `__RALPH_EPIC_ID__`; never treat the epic itself as resumable issue work.
- Prefer the smallest ready ticket first.
- Do not start tickets with unresolved dependencies.
- Do not work from `tk list` or `tk show` alone when selecting work; selection must come from the current `ready_ids` output in `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__`.
- You may create git commits for completed work, but only on the current non-`main` branch.
- Never merge into `main` or push directly to `main`.
- If the current branch is `main`, do not commit; leave a `tk add-note` on the current ticket or epic explaining the blocker instead.
- When you commit completed ticket work, include the ticket ID in the commit message, for example: `fix: upgrade react-router-dom for __RALPH_EPIC_ID__.1`.
- If you discover a real follow-up task, create a new `tk create` ticket under epic `__RALPH_EPIC_ID__` and add `tk dep` relationships only when that follow-up truly blocks other work.
- `tk` does not have a separate blocked status. Model blockers with dependency edges when appropriate, and always leave a note that explains the blocker.
- Do not print `<status>COMPLETE</status>` unless the migration backlog is actually finished.
