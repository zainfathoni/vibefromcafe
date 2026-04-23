#!/bin/bash

set -euo pipefail

MAX_ITERATIONS=${1:-25}
SLEEP_SECONDS=${RALPH_SLEEP_SECONDS:-2}
ITERATION_TIMEOUT_SECONDS=${RALPH_ITERATION_TIMEOUT_SECONDS:-1200}
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RUNNER=${RALPH_RUNNER:-}
MODEL=${RALPH_MODEL:-openai/gpt-5.4}
NOTE=${RALPH_NOTE:-}
PLAN_PATH=${RALPH_PLAN_PATH:-}
EPIC_ID=${RALPH_EPIC_ID:-}
TICKET_STATE_SCRIPT="$SCRIPT_DIR/scripts/ralph_ticket_state.py"

if ! command -v tk >/dev/null 2>&1; then
  printf 'Ticket CLI not found: tk\n' >&2
  exit 1
fi

if [ ! -f "$TICKET_STATE_SCRIPT" ]; then
  printf 'Ralph ticket helper not found: %s\n' "$TICKET_STATE_SCRIPT" >&2
  exit 1
fi

resolve_runner() {
  if [ -n "$RUNNER" ]; then
    if ! command -v "$RUNNER" >/dev/null 2>&1; then
      printf 'Runner not found: %s\n' "$RUNNER" >&2
      exit 1
    fi
    return
  fi

  if command -v opencode >/dev/null 2>&1; then
    RUNNER=opencode
    return
  fi

  if command -v omp >/dev/null 2>&1; then
    RUNNER=omp
    return
  fi

  printf 'No supported Ralph runner found. Install opencode or omp, or set RALPH_RUNNER.\n' >&2
  exit 1
}

resolve_runner

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

resolve_epic_id() {
  if [ -n "$EPIC_ID" ]; then
    return
  fi

  EPIC_ID=$(python3 "$TICKET_STATE_SCRIPT" resolve-epic)

  if [ -z "$EPIC_ID" ]; then
    printf 'No active or incomplete Ralph epic found. Nothing to do.\n'
    exit 0
  fi
}

resolve_plan_path() {
  local resolved_plan_path

  if [ -n "$PLAN_PATH" ]; then
    return
  fi

  resolved_plan_path=$(python3 - "$SCRIPT_DIR" <<'PY'
from pathlib import Path
import sys

root = Path(sys.argv[1])
plans_dir = root / "docs" / "plans"

if not plans_dir.is_dir():
    print("CLAUDE.md")
    raise SystemExit

plans = sorted(plans_dir.rglob("*.md"))
if not plans:
    print("CLAUDE.md")
    raise SystemExit

if len(plans) == 1:
    print(plans[0].relative_to(root))
    raise SystemExit

latest_plan = max(plans, key=lambda path: path.stat().st_mtime)
print(latest_plan.relative_to(root))
PY
)

  PLAN_PATH=$resolved_plan_path
}

render_prompt() {
  local prompt_file=$1

  python3 - "$SCRIPT_DIR/PROMPT.md" "$prompt_file" "$PLAN_PATH" "$EPIC_ID" <<'PY'
from pathlib import Path
import sys

template_path = Path(sys.argv[1])
output_path = Path(sys.argv[2])
plan_path = sys.argv[3]
epic_id = sys.argv[4]

content = template_path.read_text(encoding="utf-8")
content = content.replace("__RALPH_PLAN_PATH__", plan_path)
content = content.replace("__RALPH_EPIC_ID__", epic_id)
output_path.write_text(content, encoding="utf-8")
PY
}

resolve_epic_id
resolve_plan_path

PROMPT_FILE=$(mktemp)
trap 'rm -f "$PROMPT_FILE"' EXIT
render_prompt "$PROMPT_FILE"

printf 'Using Ralph scope - Epic: %s\n' "$EPIC_ID"
printf 'Using Ralph context - Plan: %s\n' "$PLAN_PATH"

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
        --dir "$SCRIPT_DIR"
        --title "Ralph Loop Iteration $i/$MAX_ITERATIONS"
        -f "$PROMPT_FILE"
        --
        "$MESSAGE"
      )

      if [ -n "$MODEL" ]; then
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
      fi

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
printf "Run 'python3 scripts/ralph_ticket_state.py summary %s' to check status.\n" "$EPIC_ID"
exit 1
