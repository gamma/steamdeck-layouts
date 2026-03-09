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

git push -u origin "$branch"

echo "Waiting for GitHub Pages deployment workflow to complete..."
run_id=$(gh run list --workflow "Deploy static site to GitHub Pages" --branch "$branch" --limit 1 --json databaseId -q '.[0].databaseId')
if [[ -n "${run_id:-}" ]]; then
  gh run watch "$run_id"
fi

echo "Potential Pages URL: https://${owner_repo%%/*}.github.io/${owner_repo##*/}/"
