#!/usr/bin/env python3

import json
import sys
from pathlib import Path
from typing import Any


ISSUES_PATH = Path(__file__).resolve().parent.parent / ".beads" / "issues.jsonl"


def load_issues() -> list[dict[str, Any]]:
    if not ISSUES_PATH.is_file():
        raise SystemExit(f"Beads issue export not found: {ISSUES_PATH}")

    issues: list[dict[str, Any]] = []
    for line in ISSUES_PATH.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line:
            continue
        issues.append(json.loads(line))
    return issues


def build_indexes(
    issues: list[dict[str, Any]],
) -> tuple[dict[str, dict[str, Any]], dict[str | None, list[str]]]:
    by_id = {issue["id"]: issue for issue in issues}
    children_by_parent: dict[str | None, list[str]] = {}
    for issue in issues:
        children_by_parent.setdefault(issue.get("parent"), []).append(issue["id"])
    return by_id, children_by_parent


def top_epic_ancestor(issue_id: str, by_id: dict[str, dict[str, Any]]) -> str | None:
    current_id = issue_id
    top_epic_id: str | None = None
    seen: set[str] = set()

    while current_id and current_id not in seen:
        seen.add(current_id)
        issue = by_id.get(current_id)
        if issue is None:
            break
        if issue.get("issue_type") == "epic":
            top_epic_id = current_id
        current_id = issue.get("parent")

    return top_epic_id


def dependency_ids(issue: dict[str, Any]) -> list[str]:
    direct = issue.get("deps")
    if isinstance(direct, list):
        return [dep_id for dep_id in direct if isinstance(dep_id, str)]

    ids: list[str] = []
    for dep in issue.get("dependencies", []):
        if not isinstance(dep, dict):
            continue
        if dep.get("dependency_type") == "parent-child":
            continue
        dep_id = dep.get("id")
        if isinstance(dep_id, str):
            ids.append(dep_id)
    return ids


def deps_satisfied(issue: dict[str, Any], by_id: dict[str, dict[str, Any]]) -> bool:
    for dep_id in dependency_ids(issue):
        dep_issue = by_id.get(dep_id)
        if dep_issue is None or dep_issue.get("status") != "closed":
            return False
    return True


def descendants(
    epic_id: str,
    by_id: dict[str, dict[str, Any]],
    children_by_parent: dict[str | None, list[str]],
) -> list[dict[str, Any]]:
    found: list[dict[str, Any]] = []
    stack = list(reversed(children_by_parent.get(epic_id, [])))
    seen: set[str] = set()

    while stack:
        issue_id = stack.pop()
        if issue_id in seen:
            continue
        seen.add(issue_id)
        issue = by_id.get(issue_id)
        if issue is None:
            continue
        found.append(issue)
        stack.extend(reversed(children_by_parent.get(issue_id, [])))

    return found


def epic_summary(epic_id: str) -> dict[str, Any]:
    issues = load_issues()
    by_id, children_by_parent = build_indexes(issues)
    return epic_summary_from_indexes(epic_id, by_id, children_by_parent)


def epic_summary_from_indexes(
    epic_id: str,
    by_id: dict[str, dict[str, Any]],
    children_by_parent: dict[str | None, list[str]],
) -> dict[str, Any]:
    epic = by_id.get(epic_id)

    if epic is None:
        raise SystemExit(f"Epic not found: {epic_id}")
    if epic.get("issue_type") != "epic":
        raise SystemExit(f"Issue is not an epic: {epic_id}")

    scoped = descendants(epic_id, by_id, children_by_parent)
    incomplete_ids = [issue["id"] for issue in scoped if issue.get("status") != "closed"]
    in_progress = [issue["id"] for issue in scoped if issue.get("status") == "in_progress"]
    open_ids = [issue["id"] for issue in scoped if issue.get("status") == "open"]
    blocked_ids = [issue["id"] for issue in scoped if issue.get("status") == "blocked"]
    ready = [
        issue["id"]
        for issue in scoped
        if issue.get("status") == "open"
        and issue.get("issue_type") != "epic"
        and deps_satisfied(issue, by_id)
    ]

    return {
        "epic_id": epic_id,
        "epic_status": epic.get("status"),
        "descendant_ids": [issue["id"] for issue in scoped],
        "incomplete_ids": incomplete_ids,
        "open_ids": open_ids,
        "in_progress_ids": in_progress,
        "blocked_ids": blocked_ids,
        "ready_ids": ready,
        "complete": not incomplete_ids,
    }


def resolve_epic() -> str:
    issues = load_issues()
    by_id, children_by_parent = build_indexes(issues)

    ready_epics: set[str] = set()
    for issue in issues:
        if issue.get("issue_type") == "epic" or issue.get("status") != "open":
            continue
        if not deps_satisfied(issue, by_id):
            continue
        epic_id = top_epic_ancestor(issue["id"], by_id)
        if epic_id:
            ready_epics.add(epic_id)

    if len(ready_epics) == 1:
        return next(iter(ready_epics))

    active_epics = [
        issue["id"]
        for issue in issues
        if issue.get("issue_type") == "epic" and issue.get("status") in {"open", "in_progress"}
    ]
    incomplete_epics = [
        epic_id
        for epic_id in active_epics
        if not epic_summary_from_indexes(epic_id, by_id, children_by_parent)["complete"]
    ]

    if len(incomplete_epics) == 1:
        return incomplete_epics[0]

    if len(incomplete_epics) > 1:
        raise SystemExit("Multiple epics have incomplete descendants. Set RALPH_EPIC_ID.")

    active_in_progress_epics = [
        issue["id"]
        for issue in issues
        if issue.get("issue_type") == "epic" and issue.get("status") == "in_progress"
    ]

    if len(active_in_progress_epics) == 1:
        return active_in_progress_epics[0]

    if len(active_epics) == 1:
        return active_epics[0]

    if not active_epics and not ready_epics:
        return ""

    if len(ready_epics) > 1:
        raise SystemExit("Multiple epics are represented in ready issues. Set RALPH_EPIC_ID.")
    raise SystemExit("Unable to determine Ralph epic automatically. Set RALPH_EPIC_ID.")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit("Usage: ralph_ticket_state.py <summary|resolve-epic> [epic-id]")

    command = sys.argv[1]
    if command == "summary":
        if len(sys.argv) != 3:
            raise SystemExit("Usage: ralph_ticket_state.py summary <epic-id>")
        json.dump(epic_summary(sys.argv[2]), sys.stdout)
        sys.stdout.write("\n")
        return
    if command == "resolve-epic":
        if len(sys.argv) != 2:
            raise SystemExit("Usage: ralph_ticket_state.py resolve-epic")
        print(resolve_epic())
        return

    raise SystemExit(f"Unknown command: {command}")


if __name__ == "__main__":
    main()
