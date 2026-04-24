---
id: br-jv0
status: open
deps: []
links: []
created: 2026-04-18T15:17:14.914511Z
type: epic
priority: 1
external-ref: https://github.com/zainfathoni/vibefromcafe/issues/27
---
# Transfer repository to vibefromcafe/web

Problem
GitHub issue #27 tracks moving this repository from `zainfathoni/vibefromcafe` to `vibefromcafe/web`. The work spans GitHub transfer/rename, Cloudflare Pages reconnect, and repo updates for stale hardcoded repository references.

Repo context
- `wrangler.toml` uses `name = "vibefromcafe"`, which is the Cloudflare Pages project name and should stay unchanged unless the Pages project itself is intentionally renamed.
- `app/routes/join.tsx` currently links to `https://github.com/zainfathoni/vibefromcafe`.
- `.github/workflows/ci.yml` and `CLAUDE.md` do not currently hardcode the old repository path.
- GitHub can handle the transfer and rename via `gh`, but Cloudflare Pages reconnect is an external dashboard step.

Goals
- Move the repository to `vibefromcafe/web` without leaving stale repo references behind.
- Preserve the Cloudflare Pages deployment path and avoid unnecessary Pages project renames.
- Capture the manual follow-through clearly enough that the move can be completed and verified end to end.

Done when
- The repository exists at `vibefromcafe/web` and the old URL redirects.
- Cloudflare Pages is reconnected to the moved repository.
- In-repo references that must change because of the move are updated.
- Local follow-up such as the `git remote set-url` command is documented in the completion trail.

Verification expectations
- Confirm the new repository is reachable with `gh repo view vibefromcafe/web`.
- Confirm the old GitHub URL redirects to the new repository.
- Confirm `app/routes/join.tsx` no longer references the old repository URL once the repo move is complete.
- Confirm the Cloudflare Pages deployment connection is valid after the transfer.


