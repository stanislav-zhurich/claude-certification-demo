---
name: pr-generator
description: Generate a pull request in a consistent format. Use when the user asks to open, create, or generate a PR.
---

Analyze the current branch and create a pull request automatically using a consistent format.

## Steps

1. Run the following in parallel:
   - `git status` — check for uncommitted changes
   - `git log main...HEAD` (or `master...HEAD`) — list commits on this branch
   - `git diff main...HEAD` — get the full diff against the base branch
   - Check if the branch has a remote tracking branch with `git rev-parse --abbrev-ref --symbolic-full-name @{u}` (suppress errors)

2. Determine the base branch: prefer `main`, fall back to `master`, then the repo default.

3. If there are uncommitted changes, warn the user and ask whether to proceed anyway.

4. If the branch has no remote tracking branch, push it with `git push -u origin HEAD`.

5. Analyze all commits and the diff to produce:
   - A concise PR **title** (under 70 characters, imperative mood, no trailing period)
   - A PR **body** using exactly this template (fill every section; do not omit any):

```
## Summary
<1–3 sentence overview of what this PR does and why>

## Changes
- <bullet: what changed, grouped logically — not a commit log>
- <bullet>
- ...

## Test plan
- [ ] <concrete step to verify the change works>
- [ ] <edge case or regression check>
- [ ] <any manual or automated test to run>

## Notes
<Optional: breaking changes, migration steps, follow-up tickets, known limitations, or "N/A" if none>

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

6. Run `gh pr create --title "<title>" --body "<body>"` using a HEREDOC to preserve formatting. If `gh` is not authenticated or the remote is not GitHub, report the error clearly.

7. Output the PR URL on success.
