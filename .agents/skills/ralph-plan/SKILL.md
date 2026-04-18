---
name: ralph-plan
description: Plan a Ralph-compatible epic and child Beads issues from a GitHub issue or repo problem statement. Produce detailed issue bodies, dependency ordering, plan-path suggestions, and exact br commands.
---

# Ralph Planning

Plan a Ralph-compatible Beads backlog from a GitHub issue or repo problem statement.

## Inputs

- `<source>`: GitHub issue URL, GitHub issue number, or a plain-language problem statement
- optional existing Beads epic ID if the user wants to plan under an existing epic
- optional desired label
- optional desired plan doc path

## Default Behavior

- Default to planning only.
- Do not create or update Beads issues unless the user explicitly asks you to execute.
- Use local `gh` and `br`; do not use GitHub connectors, GitHub MCP tools, or GitHub app actions.
- Read the repo before scoping work. Do not infer issue boundaries from GitHub alone.

## Workflow

1. Pull source context.
   - Read the GitHub issue body and comments.
   - If the source issue references child issues or related issues, inspect those too.
   - Inspect current Beads state with `br list`, `br ready`, and `br show` as needed.

2. Validate against repo reality.
   - Search the repo for the real code, scripts, docs, and config seams involved.
   - Separate confirmed repo facts from assumptions or stale issue framing.
   - Call out corrected assumptions explicitly if they change severity or scope.

3. Decide the backlog shape.
   - Prefer one epic plus direct child issues.
   - Prefer child `task`, `bug`, `feature`, or `docs` issues over nested epics.
   - Create a child epic only if the work is a distinct long-running substream with several coordinated items.
   - If an open Beads epic already covers the same scope, recommend extending it instead of duplicating it.

4. Draft the epic.
   - Write a detailed epic body that captures:
     - problem statement
     - repo context
     - goals
     - done-when criteria
     - verification expectations
   - If the source is a GitHub issue, include it as an external reference when appropriate.

5. Draft child issues.
   - Each child issue must include:
     - Problem
     - Repo context
     - Scope
     - Acceptance criteria
     - Verification
   - Make issue bodies detailed enough that Ralph can execute from Beads without needing to reconstruct intent from GitHub.
   - Preserve repo nuance when the GitHub issue framing is too broad or partially stale.

6. Make the backlog Ralph-friendly.
   - Recommend one shared label for the stream.
   - Use parent-child dependencies for structure.
   - Use blocking dependencies for ordering.
   - Prefer a dependency chain that makes `br ready --label <label> --parent <epic> --recursive` produce one obvious next issue whenever possible.

7. Recommend Ralph runtime inputs.
   - Propose:
     - `RALPH_EPIC_ID`
     - `RALPH_LABEL`
     - `RALPH_PLAN_PATH`
   - Explain the role of `RALPH_PLAN_PATH` when helpful:
     - it provides shared context to Ralph
     - it does not decide which issue Ralph picks
     - issue pickup is driven by `br ready`, epic, and label

8. Produce the planning output.
   - Return:
     - epic summary
     - child issue list
     - dependency chain
     - exact `br create` commands
     - exact `br dep add` commands
     - suggested Ralph launch command
   - If the user asked only for planning, stop there.
   - If the user explicitly asks to create the issues, execute the Beads commands only after the plan is settled.

## Ralph Compatibility Rules

- Treat `ralph.sh` and `PROMPT.md` as the execution contract.
- Plan so that Beads issues stand on their own even if the plan file is skimmed.
- Use the plan file for shared context, sequencing, corrected assumptions, and cross-issue rules.
- Do not rely on GitHub issues alone as Ralph's source of truth once the Beads backlog exists.
- Prefer issue scopes that can be completed with the smallest correct change.

## Issue-Writing Rules

- Be explicit when the real repo contract differs from older docs or issue text.
- Prefer concrete repo references over generic wording.
- Describe "done" in observable terms.
- Describe verification as commands or explicit checks whenever possible.
- Keep issue scope narrow enough to avoid ambiguous ownership.
- Use P1 for core unblockers and P2 for follow-up docs or verification unless the repo context justifies otherwise.
- Preserve the distinction between workflow hygiene and actual security exposure when that nuance matters.
- Avoid writing vague issue bodies that just restate a title.

## Output Template

Use this response structure unless the user asks for something else.

### Epic

- title
- type
- priority
- label
- external refs
- detailed description

### Children

- one entry per issue with:
  - title
  - type
  - priority
  - external refs
  - detailed description

### Dependencies

- explicit parent-child and blocking relationships

### Exact Commands

- `br create` commands for the epic and all children
- `br dep add` commands for ordering
- verification commands to inspect the resulting backlog

### Ralph Launch

- exact command using:
  - `RALPH_EPIC_ID`
  - `RALPH_LABEL`
  - `RALPH_PLAN_PATH`

## Safety

- Do not create duplicate epics or duplicate child issues if an open Beads backlog already covers the same work.
- Do not execute `br create`, `br update`, or `br dep add` unless the user explicitly asks you to create or modify the backlog.
- Do not use GitHub MCP or app actions in this repo; use `gh`.
- If the scope is ambiguous, ask one short clarifying question before drafting the backlog.

## Example Prompts

- `/ralph-plan https://github.com/vibefromcafe/cafein.id/issues/10`
- `/ralph-plan Plan a Ralph-compatible epic and child Beads issues for the local Supabase workflow cleanup`
- `/ralph-plan Plan this under existing epic cf-1234 with label supabase-dev-workflows`
