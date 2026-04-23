#!/usr/bin/env python3

import json
import subprocess
import sys
from typing import Any


def load_tickets() -> list[dict[str, Any]]:
    result = subprocess.run(["tk", "query", "."], check=True, capture_output=True, text=True)
    tickets: list[dict[str, Any]] = []
    for line in result.stdout.splitlines():
        line = line.strip()
        if not line:
            continue
        tickets.append(json.loads(line))
    return tickets


def normalized_parent(ticket: dict[str, Any]) -> str | None:
    parent = ticket.get("parent")
    if isinstance(parent, str) and parent:
        return parent

    ticket_id = ticket.get("id")
    if isinstance(ticket_id, str) and "." in ticket_id:
        return ticket_id.rsplit(".", 1)[0]
    return None


def build_indexes(tickets: list[dict[str, Any]]) -> tuple[dict[str, dict[str, Any]], dict[str | None, list[str]]]:
    by_id = {ticket["id"]: ticket for ticket in tickets}
    children_by_parent: dict[str | None, list[str]] = {}
    for ticket in tickets:
        children_by_parent.setdefault(normalized_parent(ticket), []).append(ticket["id"])
    return by_id, children_by_parent


def top_epic_ancestor(ticket_id: str, by_id: dict[str, dict[str, Any]]) -> str | None:
    current_id = ticket_id
    top_epic_id: str | None = None
    seen: set[str] = set()

    while current_id and current_id not in seen:
        seen.add(current_id)
        ticket = by_id.get(current_id)
        if ticket is None:
            break
        if ticket.get("type") == "epic":
            top_epic_id = current_id
        current_id = normalized_parent(ticket)

    return top_epic_id


def deps_satisfied(ticket: dict[str, Any], by_id: dict[str, dict[str, Any]]) -> bool:
    for dep_id in ticket.get("deps", []):
        dep_ticket = by_id.get(dep_id)
        if dep_ticket is None or dep_ticket.get("status") != "closed":
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
        ticket_id = stack.pop()
        if ticket_id in seen:
            continue
        seen.add(ticket_id)
        ticket = by_id.get(ticket_id)
        if ticket is None:
            continue
        found.append(ticket)
        stack.extend(reversed(children_by_parent.get(ticket_id, [])))

    return found


def epic_summary(epic_id: str) -> dict[str, Any]:
    tickets = load_tickets()
    by_id, children_by_parent = build_indexes(tickets)
    return epic_summary_from_indexes(epic_id, by_id, children_by_parent)


def epic_summary_from_indexes(
    epic_id: str,
    by_id: dict[str, dict[str, Any]],
    children_by_parent: dict[str | None, list[str]],
) -> dict[str, Any]:
    epic = by_id.get(epic_id)

    if epic is None:
        raise SystemExit(f"Epic not found: {epic_id}")
    if epic.get("type") != "epic":
        raise SystemExit(f"Ticket is not an epic: {epic_id}")

    scoped = descendants(epic_id, by_id, children_by_parent)
    in_progress = [ticket["id"] for ticket in scoped if ticket.get("status") == "in_progress"]
    open_ids = [ticket["id"] for ticket in scoped if ticket.get("status") == "open"]
    ready = [
        ticket["id"]
        for ticket in scoped
        if ticket.get("status") == "open" and ticket.get("type") != "epic" and deps_satisfied(ticket, by_id)
    ]

    return {
        "epic_id": epic_id,
        "epic_status": epic.get("status"),
        "descendant_ids": [ticket["id"] for ticket in scoped],
        "open_ids": open_ids,
        "in_progress_ids": in_progress,
        "ready_ids": ready,
        "complete": not open_ids and not in_progress,
    }


def resolve_epic() -> str:
    tickets = load_tickets()
    by_id, children_by_parent = build_indexes(tickets)

    ready_epics: set[str] = set()
    for ticket in tickets:
        if ticket.get("type") == "epic" or ticket.get("status") != "open":
            continue
        if not deps_satisfied(ticket, by_id):
            continue
        epic_id = top_epic_ancestor(ticket["id"], by_id)
        if epic_id:
            ready_epics.add(epic_id)

    if len(ready_epics) == 1:
        return next(iter(ready_epics))

    active_epics = [ticket["id"] for ticket in tickets if ticket.get("type") == "epic" and ticket.get("status") in {"open", "in_progress"}]
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
        ticket["id"]
        for ticket in tickets
        if ticket.get("type") == "epic" and ticket.get("status") == "in_progress"
    ]

    if len(active_in_progress_epics) == 1:
        return active_in_progress_epics[0]

    if len(active_epics) == 1:
        return active_epics[0]

    if not active_epics and not ready_epics:
        return ""

    if len(ready_epics) > 1:
        raise SystemExit("Multiple epics are represented in ready tickets. Set RALPH_EPIC_ID.")
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
