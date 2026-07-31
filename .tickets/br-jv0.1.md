---
id: br-jv0.1
status: closed
deps: []
links: []
created: 2026-04-18T15:17:45.570171Z
type: task
priority: 1
parent: br-jv0
---
# [Superseded] Execute repo transfer and update moved-repo references

Resolution
This task is superseded by `https://github.com/vibefromcafe/vibefromcafe/issues/1`. The organization repository is canonical and retains the name `vibefromcafe`; this repository remains the legacy source until cutover is complete. Do not execute the transfer, rename, archive, or Cloudflare reconnection steps below.

The text below is retained only as historical context.

Problem
GitHub issue #27 requires a repository transfer plus a few concrete follow-up updates so the moved repo keeps working cleanly. The operational steps and the repo edits need to be tracked together because the move is only complete when both the GitHub location and the in-repo references are correct.

Repo context
- Source issue: `https://github.com/zainfathoni/vibefromcafe/issues/27`.
- `app/routes/join.tsx` currently points at the old repository URL.
- `wrangler.toml` uses the Cloudflare Pages project name, not the GitHub repo slug, so it should stay `vibefromcafe` unless there is a separate Pages rename decision.
- `.github/workflows/ci.yml` and `CLAUDE.md` do not currently need repo-slug updates based on the confirmed repo search.
- Cloudflare Pages reconnect is a manual dashboard step after the GitHub move.

Scope
- Transfer the GitHub repository into the `vibefromcafe` org and rename it to `web`.
- Reconnect the Cloudflare Pages project to the moved repository.
- Update any explicit old-repo references that should change because of the move, including the join-page GitHub link.
- Record the local `git remote set-url` follow-up needed after the transfer.

Acceptance criteria
- The repository is reachable at `vibefromcafe/web`.
- The old GitHub repository URL redirects to the new repository.
- `app/routes/join.tsx` no longer links to the old repo path.
- Cloudflare Pages is connected to the moved repository and the deployment path is validated.
- The close reason or task comments capture the concrete post-move commands and verification results.

Verification
- Run `gh repo view vibefromcafe/web`.
- Confirm the old GitHub URL redirects to the new repository.
- Run `grep` or equivalent repo search to confirm the old repo URL is gone from tracked source files that should change.
- If tracked source files change, run the relevant project verification commands for those edits.
