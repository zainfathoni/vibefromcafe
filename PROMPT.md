# Ralph Loop Prompt

You are working inside `/Users/zain/Code/GitHub/zainfathoni/vibefromcafe`.

Your issue tracker is repo-local `br`, not GitHub issues.

Backlog source of truth:

- `__RALPH_PLAN_PATH__`

Execution scope:

- epic: `__RALPH_EPIC_ID__`

Execution contract for this single run:

1. Read the plan file if you need shared context.
2. Before running any app-level verification or tests that need the dev server, check whether a suitable dev server is already running and reuse it if available; only start a new server if none is running.
3. Check for already claimed work first:
   - `br show __RALPH_EPIC_ID__ --json`
   - `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__`
4. Treat only descendant issues of `__RALPH_EPIC_ID__` as matching already-claimed work; do not treat the epic `__RALPH_EPIC_ID__` itself as a resumable issue.
5. If exactly one matching descendant issue is already `in_progress`, resume that issue instead of selecting a new one.
6. If more than one matching descendant issue is already `in_progress`, do not pick new work. Leave a clear note describing the conflict if needed, run `br sync --flush-only`, and stop.
7. If no matching issue is `in_progress`, use the `ready_ids` from `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__` to determine ready work.
8. If the summary reports `complete: true` for this epic, print exactly `<status>COMPLETE</status>` on its own line and stop.
9. Otherwise, pick exactly one ready issue from this backlog.
10. Only pick an issue that appears in the current `ready_ids` output. Do not pick blocked, in-progress, or merely open issues that are not in the ready set.
11. Immediately before claiming the issue, re-run `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__` and confirm the same issue is still ready.
12. Mark it `in_progress` before making changes.
13. Implement the smallest correct change needed for that issue.
14. Run relevant verification for the issue.
15. If the issue is successfully completed, create a git commit before closing it.
16. The commit message must include the issue ID so `br` can trace the commit to the issue.
17. For a successful completion, close the issue only after the commit exists, and use `br close -r` so the close reason records what changed, what was verified, and the commit hash.
18. If the issue is not complete, leave it open, in progress, or blocked with a clear `br comments add` note.
19. Run `br sync --flush-only` before stopping.

Working rules:

- Only work on issues in this backlog stream.
- Resume an existing `in_progress` issue before looking for new ready work.
- For the `in_progress` check, match only descendant issues of `__RALPH_EPIC_ID__`; never treat the epic itself as resumable issue work.
- Prefer the smallest ready issue first.
- Do not start blocked issues.
- Do not work from `br list` or `br show` alone when selecting work; selection must come from the current `ready_ids` output in `python3 scripts/ralph_ticket_state.py summary __RALPH_EPIC_ID__`.
- You may create git commits for completed work, but only on the current non-`main` branch.
- Never merge into `main` or push directly to `main`.
- If the current branch is `main`, do not commit; leave a `br` comment explaining the blocker instead.
- When you commit completed issue work, include the issue ID in the commit message.
- If you discover a real follow-up task, create a new `br` issue under epic `__RALPH_EPIC_ID__`.
- If you cannot complete the current issue after reasonable effort, set its status to `blocked` and add a `br comments add` note describing the blocker, what you tried, and what must happen next.
- Do not print `<status>COMPLETE</status>` unless the backlog is actually finished.
