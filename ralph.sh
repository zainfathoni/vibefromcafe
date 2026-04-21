#!/bin/bash

set -euo pipefail

MAX_ITERATIONS=${1:-25}
SLEEP_SECONDS=${RALPH_SLEEP_SECONDS:-2}
ITERATION_TIMEOUT_SECONDS=${RALPH_ITERATION_TIMEOUT_SECONDS:-1200}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER=${RALPH_RUNNER:-opencode}
MODEL=${RALPH_MODEL:-openai/gpt-5.4}
NOTE=${RALPH_NOTE:-}
PLAN_PATH=${RALPH_PLAN_PATH:-docs/plans/2026-04-18-repo-transfer-to-vibefromcafe-web.md}
EPIC_ID=${RALPH_EPIC_ID:-}
LABEL=${RALPH_LABEL:-}

if ! command -v "$RUNNER" >/dev/null 2>&1; then
  printf 'Runner not found: %s\n' "$RUNNER" >&2
  exit 1
fi

if [ "$ITERATION_TIMEOUT_SECONDS" -gt 0 ]; then
  printf 'Starting Ralph with %s - Max iterations: %s - Timeout: %ss\n' "$RUNNER" "$MAX_ITERATIONS" "$ITERATION_TIMEOUT_SECONDS"
else
  printf 'Starting Ralph with %s - Max iterations: %s - Timeout: disabled\n' "$RUNNER" "$MAX_ITERATIONS"
fi

run_with_timeout() {
  local output_file=$1
  shift

  python3 - "$ITERATION_TIMEOUT_SECONDS" "$output_file" "$@" <<'PY'
import os
import select
import signal
import subprocess
import sys
import time

timeout = int(sys.argv[1])
output_path = sys.argv[2]
command = sys.argv[3:]

use_process_group = hasattr(os, "setsid")
process = subprocess.Popen(
    command,
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1,
    preexec_fn=os.setsid if use_process_group else None,
)

start = time.time()

def terminate_process() -> None:
    try:
        if use_process_group:
            os.killpg(process.pid, signal.SIGTERM)
        else:
            process.terminate()
    except ProcessLookupError:
        return

    try:
        process.wait(timeout=5)
    except subprocess.TimeoutExpired:
        try:
            if use_process_group:
                os.killpg(process.pid, signal.SIGKILL)
            else:
                process.kill()
        except ProcessLookupError:
            return

with open(output_path, "w", encoding="utf-8", errors="replace") as output:
    stream = process.stdout
    assert stream is not None

    while True:
        if timeout > 0 and time.time() - start >= timeout:
            print(
                f"Ralph iteration timed out after {timeout}s. Terminating runner.",
                file=sys.stderr,
            )
            terminate_process()
            sys.exit(124)

        if process.poll() is not None:
            remainder = stream.read()
            if remainder:
                sys.stdout.write(remainder)
                sys.stdout.flush()
                output.write(remainder)
                output.flush()
            sys.exit(process.returncode)

        ready, _, _ = select.select([stream], [], [], 1)
        if not ready:
            continue

        line = stream.readline()
        if not line:
            continue

        sys.stdout.write(line)
        sys.stdout.flush()
        output.write(line)
        output.flush()
PY
}

build_opencode_env_prefix() {
  local env_cmd=(env)
  local var_name

  # Nested opencode runs inherit the current agent session variables and try to
  # attach to a parent session that does not exist in the child process.
  for var_name in $(env | cut -d= -f1 | grep '^OPENCODE'); do
    env_cmd+=(-u "$var_name")
  done

  OPENCODE_ENV_PREFIX=("${env_cmd[@]}")
}

json_issue_count() {
  python3 -c 'import json, sys; data = json.load(sys.stdin); issues = data.get("issues", data) if isinstance(data, dict) else data; print(len(issues))'
}

json_issue_id_at_index() {
  local index=$1
  python3 -c 'import json, sys; index = int(sys.argv[1]); data = json.load(sys.stdin); issues = data.get("issues", data) if isinstance(data, dict) else data; print(issues[index]["id"] if len(issues) > index else "")' "$index"
}

json_issue_ids() {
  python3 -c 'import json, sys; data = json.load(sys.stdin); issues = data.get("issues", data) if isinstance(data, dict) else data; print("\n".join(issue["id"] for issue in issues))'
}

json_first_parent() {
  python3 -c 'import json, sys; data = json.load(sys.stdin); issues = data.get("issues", data) if isinstance(data, dict) else data; print(issues[0].get("parent", "") if issues else "")'
}

build_ready_command() {
  READY_CMD=(br ready --json)
  if [ -n "$LABEL" ]; then
    READY_CMD+=(--label "$LABEL")
  fi
}

build_active_epics_command() {
  ACTIVE_EPICS_CMD=(br list --type epic --status open --status in_progress --json)
  if [ -n "$LABEL" ]; then
    ACTIVE_EPICS_CMD+=(--label "$LABEL")
  fi
}

resolve_epic_id() {
  local active_epics_json
  local existing_parent
  local found_parent
  local first_ready_issue_id
  local issue_id
  local ready_epic_count=0
  local ready_issue_ids
  local ready_json
  local ready_parent
  local ready_parent_list=''

  if [ -n "$EPIC_ID" ]; then
    return
  fi

  build_ready_command
  ready_json=$("${READY_CMD[@]}")
  ready_issue_ids=$(printf '%s' "$ready_json" | json_issue_ids)
  first_ready_issue_id=$(printf '%s' "$ready_json" | json_issue_id_at_index 0)

  while IFS= read -r issue_id; do
    [ -n "$issue_id" ] || continue

    ready_parent=$(br show "$issue_id" --json | json_first_parent)
    if [ -z "$ready_parent" ]; then
      continue
    fi

    found_parent=0
    while IFS= read -r existing_parent; do
      if [ "$existing_parent" = "$ready_parent" ]; then
        found_parent=1
        break
      fi
    done <<EOF
$(printf '%b' "$ready_parent_list")
EOF

    if [ "$found_parent" -eq 0 ]; then
      ready_parent_list="${ready_parent_list}${ready_parent}\n"
      ready_epic_count=$((ready_epic_count + 1))
    fi
  done <<EOF
$ready_issue_ids
EOF

  if [ "$ready_epic_count" -eq 1 ]; then
    while IFS= read -r ready_parent; do
      if [ -n "$ready_parent" ]; then
        EPIC_ID=$ready_parent
        break
      fi
    done <<EOF
$(printf '%b' "$ready_parent_list")
EOF
    return
  fi

  if [ "$ready_epic_count" -gt 1 ]; then
    printf 'Multiple epics are represented in br ready. Set RALPH_EPIC_ID.\n' >&2
    exit 1
  fi

  if [ -z "$first_ready_issue_id" ]; then
    build_active_epics_command
    active_epics_json=$("${ACTIVE_EPICS_CMD[@]}")
    EPIC_ID=$(printf '%s' "$active_epics_json" | json_issue_id_at_index 0)
    if [ -n "$EPIC_ID" ]; then
      return
    fi

    printf 'Unable to determine Ralph epic automatically. Set RALPH_EPIC_ID.\n' >&2
    exit 1
  fi

  ready_parent=$(br show "$first_ready_issue_id" --json | json_first_parent)
  if [ -z "$ready_parent" ]; then
    printf 'Ready issue %s has no parent epic. Set RALPH_EPIC_ID.\n' "$first_ready_issue_id" >&2
    exit 1
  fi

  EPIC_ID=$ready_parent
}

render_prompt() {
  local prompt_file=$1

  python3 - "$SCRIPT_DIR/PROMPT.md" "$prompt_file" "$PLAN_PATH" "$EPIC_ID" "$LABEL" <<'PY'
from pathlib import Path
import sys

template_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
plan_path = sys.argv[3]
epic_id = sys.argv[4]
label = sys.argv[5]

content = template_path.read_text(encoding="utf-8")
content = content.replace("__RALPH_PLAN_PATH__", plan_path)
content = content.replace("__RALPH_EPIC_ID__", epic_id)
content = content.replace("__RALPH_LABEL__", label)
output_path.write_text(content, encoding="utf-8")
PY
}

resolve_epic_id

PROMPT_FILE=$(mktemp)
trap 'rm -f "$PROMPT_FILE"' EXIT
render_prompt "$PROMPT_FILE"

printf 'Using Ralph scope - Epic: %s - Label: %s\n' "$EPIC_ID" "$LABEL"

for i in $(seq 1 "$MAX_ITERATIONS"); do
  printf '\n═══════════════════════════════════════════════════════\n'
  printf ' Ralph Iteration %s of %s\n' "$i" "$MAX_ITERATIONS"
  printf '═══════════════════════════════════════════════════════\n'

  OUTPUT_FILE=$(mktemp)

  case "$RUNNER" in
    opencode)
      build_opencode_env_prefix

      MESSAGE="Follow the attached PROMPT.md exactly and execute one Ralph loop iteration. When you are finished, stop cleanly and do not wait for additional input."
      if [ -n "$NOTE" ]; then
        MESSAGE="$MESSAGE Additional runtime note: $NOTE"
      fi

      CMD=(
        "${OPENCODE_ENV_PREFIX[@]}"
        opencode run
        --dangerously-skip-permissions
        --model "$MODEL"
        --dir "$SCRIPT_DIR"
        --title "Ralph Loop Iteration $i/$MAX_ITERATIONS"
        -f "$PROMPT_FILE"
        --
        "$MESSAGE"
      )

      run_with_timeout "$OUTPUT_FILE" "${CMD[@]}" || true
      ;;
    omp)
      if [ -n "$NOTE" ]; then
        CMD=(omp -p @"$PROMPT_FILE" "$NOTE")
      else
        CMD=(omp -p @"$PROMPT_FILE")
      fi

      run_with_timeout "$OUTPUT_FILE" "${CMD[@]}" || true
      ;;
    *)
      rm -f "$OUTPUT_FILE"
      printf 'Unsupported Ralph runner: %s\n' "$RUNNER" >&2
      exit 1
      ;;
  esac

  OUTPUT=$(<"$OUTPUT_FILE")
  rm -f "$OUTPUT_FILE"

  if printf '%s' "$OUTPUT" | grep -Fqx '<status>COMPLETE</status>'; then
    printf '\nRalph completed all tasks!\n'
    printf 'Completed at iteration %s of %s\n' "$i" "$MAX_ITERATIONS"
    exit 0
  fi

  printf 'Iteration %s complete. Continuing...\n' "$i"
  sleep "$SLEEP_SECONDS"
done

printf '\nRalph reached max iterations (%s) without completing all tasks.\n' "$MAX_ITERATIONS"
printf "Run 'br ready --label %s --parent %s --recursive' to check status.\n" "$LABEL" "$EPIC_ID"
exit 1
