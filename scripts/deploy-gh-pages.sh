#!/usr/bin/env bash
set -euo pipefail

if ! command -v gh >/dev/null 2>&1; then
  echo "GitHub CLI (gh) is required." >&2
  exit 1
fi

if ! gh auth status >/dev/null 2>&1; then
  echo "GitHub CLI is not authenticated. Run: gh auth login" >&2
  exit 2
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "No git remote named 'origin' found. Add one first." >&2
  exit 3
fi

owner_repo=$(gh repo view --json nameWithOwner -q .nameWithOwner)
if [[ -z "$owner_repo" ]]; then
  echo "Unable to detect owner/repo from origin." >&2
  exit 4
fi

branch=$(git branch --show-current)
if [[ "$branch" != "main" ]]; then
  echo "Pages deploys from main only; current branch is '$branch'." >&2
  exit 5
fi
head_sha=$(git rev-parse HEAD)

git push -u origin "$branch"

echo "Waiting for the GitHub Pages workflow run of ${head_sha:0:7}..."
run_id=""
for _ in $(seq 1 30); do
  # Match the run to the pushed commit; the newest run may still be an older one.
  run_id=$(gh run list --workflow "Deploy static site to GitHub Pages" --branch "$branch" --limit 10 \
    --json databaseId,headSha -q ".[] | select(.headSha == \"$head_sha\") | .databaseId" | head -n 1)
  [[ -n "$run_id" ]] && break
  sleep 2
done
if [[ -n "$run_id" ]]; then
  gh run watch "$run_id" --exit-status
else
  echo "No workflow run found for ${head_sha:0:7} yet; check the Actions tab." >&2
fi

echo "Potential Pages URL: https://${owner_repo%%/*}.github.io/${owner_repo##*/}/"
