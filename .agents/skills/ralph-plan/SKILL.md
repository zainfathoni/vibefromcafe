---
name: ralph-plan
description: Plan a Ralph-compatible epic and child tk tickets from a GitHub issue or repo problem statement. Produce detailed ticket bodies, dependency ordering, plan-path suggestions, and exact tk commands.
---

# Ralph Planning

Plan a Ralph-compatible tk backlog from a GitHub issue or repo problem statement.

## Inputs

- `<source>`: GitHub issue URL, GitHub issue number, or a plain-language problem statement
- optional existing tk epic ID if the user wants to plan under an existing epic
- optional desired plan doc path

## Default Behavior

- Default to planning only.
- Do not create or update tk tickets unless the user explicitly asks you to execute.
- Use local `gh` and `tk`; do not use GitHub connectors, GitHub MCP tools, or GitHub app actions.
- Read the repo before scoping work. Do not infer issue boundaries from GitHub alone.

## Workflow

1. Pull source context.
   - Read the GitHub issue body and comments.
   - If the source issue references child issues or related issues, inspect those too.
   - Inspect current tk state with `tk list`, `tk ready`, and `tk show` as needed.

2. Validate against repo reality.
   - Search the repo for the real code, scripts, docs, and config seams involved.
   - Separate confirmed repo facts from assumptions or stale issue framing.
   - Call out corrected assumptions explicitly if they change severity or scope.

3. Decide the backlog shape.
   - Prefer one epic plus direct child issues.
   - Prefer child `task`, `bug`, `feature`, or `docs` issues over nested epics.
   - Create a child epic only if the work is a distinct long-running substream with several coordinated items.
   - If an open tk epic already covers the same scope, recommend extending it instead of duplicating it.

4. Draft the epic.
   - Write a detailed epic body that captures:
     - problem statement
     - repo context
     - goals
     - done-when criteria
     - verification expectations
   - If the source is a GitHub issue, include it as an external reference when appropriate.

5. Draft child tickets.
   - Each child ticket must include:
     - Problem
     - Repo context
     - Scope
     - Acceptance criteria
     - Verification
   - Make ticket bodies detailed enough that Ralph can execute from tk without needing to reconstruct intent from GitHub.
   - Preserve repo nuance when the GitHub issue framing is too broad or partially stale.

6. Make the backlog Ralph-friendly.
   - Use parent-child structure for the stream.
   - Use blocking dependencies for ordering.
   - Prefer a dependency chain that makes `tk ready` produce one obvious next ticket whenever possible.

7. Recommend Ralph runtime inputs.
   - Propose:
     - `RALPH_EPIC_ID`
     - `RALPH_PLAN_PATH`
   - Explain the role of `RALPH_PLAN_PATH` when helpful:
     - it provides shared context to Ralph
     - it does not decide which ticket Ralph picks
     - ticket pickup is driven by `tk ready` and epic scope

8. Produce the planning output.
   - Return:
     - epic summary
      - child ticket list
      - dependency chain
      - exact `tk create` commands
      - exact `tk dep` commands
      - suggested Ralph launch command
    - If the user asked only for planning, stop there.
    - If the user explicitly asks to create the tickets, execute the tk commands only after the plan is settled.

## Ralph Compatibility Rules

- Treat `ralph.sh` and `PROMPT.md` as the execution contract.
- Plan so that tk tickets stand on their own even if the plan file is skimmed.
- Use the plan file for shared context, sequencing, corrected assumptions, and cross-issue rules.
- Do not rely on GitHub issues alone as Ralph's source of truth once the tk backlog exists.
- Prefer ticket scopes that can be completed with the smallest correct change.

## Issue-Writing Rules

- Be explicit when the real repo contract differs from older docs or issue text.
- Prefer concrete repo references over generic wording.
- Describe "done" in observable terms.
- Describe verification as commands or explicit checks whenever possible.
- Keep ticket scope narrow enough to avoid ambiguous ownership.
- Use P1 for core unblockers and P2 for follow-up docs or verification unless the repo context justifies otherwise.
- Preserve the distinction between workflow hygiene and actual security exposure when that nuance matters.
- Avoid writing vague issue bodies that just restate a title.

## Output Template

Use this response structure unless the user asks for something else.

### Epic

- title
- type
- priority
- external refs
- detailed description

### Children

- one entry per ticket with:
  - title
  - type
  - priority
  - external refs
  - detailed description

### Dependencies

- explicit parent-child and blocking relationships

### Exact Commands

- `tk create` commands for the epic and all children
- `tk dep` commands for ordering
- verification commands to inspect the resulting backlog

### Ralph Launch

- exact command using:
  - `RALPH_EPIC_ID`
  - `RALPH_PLAN_PATH`

## Safety

- Do not create duplicate epics or duplicate child tickets if an open tk backlog already covers the same work.
- Do not execute `tk create`, `tk start`, `tk close`, `tk dep`, or `tk add-note` unless the user explicitly asks you to create or modify the backlog.
- Do not use GitHub MCP or app actions in this repo; use `gh`.
- If the scope is ambiguous, ask one short clarifying question before drafting the backlog.

## Example Prompts

- `/ralph-plan https://github.com/vibefromcafe/cafein.id/issues/10`
- `/ralph-plan Plan a Ralph-compatible epic and child tk tickets for the local Supabase workflow cleanup`
- `/ralph-plan Plan this under existing epic cf-1234`
