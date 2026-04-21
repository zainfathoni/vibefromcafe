# Ralph Loop Prompt

You are working inside `/Users/zain/Code/GitHub/zainfathoni/vibefromcafe`.

Your issue tracker is repo-local `br`, not GitHub issues.

Backlog source of truth:

- `__RALPH_PLAN_PATH__`

Execution scope:

- epic: `__RALPH_EPIC_ID__`
- label: `__RALPH_LABEL__`

Execution contract for this single run:

1. Read the plan file if you need shared context.
2. Before running any app-level verification or tests that need the dev server, check whether a suitable dev server is already running and reuse it if available; only start a new server if none is running.
   If `br` prints noisy logs in this environment, you may run `export RUST_LOG=error` once before using it.
3. Check for already claimed work first:
   - `br show __RALPH_EPIC_ID__ --json`
   - `br list --status=in_progress --label __RALPH_LABEL__ --json`
4. Treat only descendant issues of `__RALPH_EPIC_ID__` as matching already-claimed work; do not treat the epic `__RALPH_EPIC_ID__` itself as a resumable issue.
5. If exactly one matching descendant issue is already `in_progress`, resume that issue instead of selecting a new one.
6. If more than one matching descendant issue is already `in_progress`, do not pick new work. Leave a clear note describing the conflict if needed, run `br sync --flush-only`, and stop.
7. If no matching issue is `in_progress`, check ready work with:
   - `br ready --json --label __RALPH_LABEL__ --parent __RALPH_EPIC_ID__ --recursive`
8. If there is no ready work, inspect the epic state:
   - `br show __RALPH_EPIC_ID__ --json`
9. If there are no open or in-progress descendants left under this epic, print exactly `<status>COMPLETE</status>` on its own line and stop.
10. Otherwise, pick exactly one ready issue from this backlog.
11. Only pick an issue that appears in the current `br ready --json` output. Do not pick blocked, in-progress, or merely open issues that are not in the ready set.
12. Immediately before claiming the issue, re-check that it is still ready and unblocked. If it is no longer ready, blocked, or already in progress, do not claim it, do not work on it, and do not pick a replacement in the same run.
13. Mark it `in_progress` before making changes.
14. Implement the smallest correct change needed for that issue.
15. Run relevant verification for the issue.
16. If the issue is successfully completed, create a git commit before closing it.
17. The commit message must include the issue ID so `br` can trace the commit to the issue.
18. For a successful completion, close the issue only after the commit exists, and use `br close -r` so the close reason records what changed, what was verified, and the commit hash.
19. If the issue is not complete, leave it open, in progress, or blocked with a clear `br comments add` note.
20. Run `br sync --flush-only` before stopping.

Working rules:

- Only work on issues in this backlog stream.
- Resume an existing `in_progress` issue before looking at `br ready` for new work.
- For the `in_progress` check, match only descendant issues of `__RALPH_EPIC_ID__`; never treat the epic itself as resumable issue work.
- Prefer the smallest ready issue first.
- Do not start blocked issues.
- Do not work from `br list` or `br show` alone when selecting work; selection must come from the current `br ready --json` result.
- You may create git commits for completed work, but only on the current non-`main` branch.
- Never merge into `main` or push directly to `main`.
- If the current branch is `main`, do not commit; leave a `br` comment explaining the blocker instead.
- When you commit completed issue work, include the issue ID in the commit message.
- If you discover a real follow-up task, create a new `br` issue under epic `__RALPH_EPIC_ID__` with the `__RALPH_LABEL__` label.
- If you cannot complete the current issue after reasonable effort, set its status to `blocked` and add a `br comments add` note describing the blocker, what you tried, and what must happen next.
- Do not print `<status>COMPLETE</status>` unless the backlog is actually finished.
