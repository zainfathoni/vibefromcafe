# Repo Transfer To `vibefromcafe/web`

## Source

- GitHub issue: `https://github.com/zainfathoni/vibefromcafe/issues/27`

## Confirmed Repo Context

- `wrangler.toml` uses `name = "vibefromcafe"`, which is the Cloudflare Pages project name and should not be renamed just because the GitHub repository moves.
- `app/routes/join.tsx` currently links to `https://github.com/zainfathoni/vibefromcafe` and will need updating after the transfer.
- `.github/workflows/ci.yml` and `CLAUDE.md` do not currently hardcode the old repository path.
- The transfer itself is partly operational work outside the repo: GitHub transfer/rename and Cloudflare Pages reconnect in the dashboard.

## Ralph Guidance

- Treat the Beads child issue as the execution source of truth.
- Keep code changes limited to concrete repo references that must change because of the move.
- Record manual steps and verification clearly in the close reason.
- Do not mark the backlog complete until both repo updates and external operational follow-through are captured.

## Expected Verification

- `gh repo view vibefromcafe/web` succeeds after the move.
- `git remote -v` points at `git@github.com:vibefromcafe/web.git` locally when the task is done.
- `app/routes/join.tsx` no longer points at the old repo URL.
- Cloudflare Pages is reconnected to the moved repo and a deployment path is confirmed.
