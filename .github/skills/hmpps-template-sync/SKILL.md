---
name: hmpps-template-sync
description: >
  Helps apply changes from the hmpps-template-typescript shared template to this repository.
  Use this skill when asked to: sync template changes, apply upstream template updates, check
  what template changes are available, or apply a specific template PR to this repo.
---

# HMPPS Template Sync Skill

This skill helps you apply changes from the [hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript) shared template to the current repository.

The template maintainers publish a changelog at `https://raw.githubusercontent.com/ministryofjustice/hmpps-template-typescript/main/CHANGELOG.md`. Each entry links to the GitHub PR that introduced the change — this skill fetches those diffs and applies them using `git apply --3way`.

Scripts for this skill are located at `.github/skills/hmpps-template-sync/scripts/`.

---

## Step 1: List available template changes

Run the list-changes script and display its output directly to the user:

```bash
node .github/skills/hmpps-template-sync/scripts/list-changes.mjs
```

The output is a numbered list ready to display. Each entry includes the date, title, PR number(s), PR URL(s), and a one-line description hint.

To show only a subset, use `--limit` and `--from`:

```bash
# Show first 20 entries
node .github/skills/hmpps-template-sync/scripts/list-changes.mjs --limit 20

# Show entries 21 onwards
node .github/skills/hmpps-template-sync/scripts/list-changes.mjs --from 21
```

Ask the user which change(s) they'd like to apply or inspect. They can specify by number in the list, by PR number (e.g. "apply #679"), or by describing the change.

---

## Step 2: Show details for a specific change

If the user asks to see more details about an entry before applying it, run the get-change-details script and display its output:

```bash
node .github/skills/hmpps-template-sync/scripts/get-change-details.mjs <pr-number>
```

For example:

```bash
node .github/skills/hmpps-template-sync/scripts/get-change-details.mjs 679
```

This outputs the PR title, URL, merge date, full description, and a list of all changed files with additions/deletions counts.

---

## Step 3: Apply a selected change

Once the user has selected a change, run the apply-change script with the PR number:

```bash
node .github/skills/hmpps-template-sync/scripts/apply-change.mjs <pr-number>
```

For example, to apply PR #679:

```bash
node .github/skills/hmpps-template-sync/scripts/apply-change.mjs 679
```

To preview what would change without modifying files, add `--dry-run`:

```bash
node .github/skills/hmpps-template-sync/scripts/apply-change.mjs 679 --dry-run
```

The script outputs JSON with these fields:
- `appliedFiles` — files patched cleanly
- `conflictFiles` — files that need manual conflict resolution (contain `<<<<<<<` markers)
- `skippedFiles` — files where the patch couldn't be applied at all (file missing or too diverged)
- `success` — `true` if at least a partial apply succeeded
- `gitOutput` — raw output from git (if any errors occurred)

---

## Step 4: Report the outcome

After running apply-change, summarise the result clearly:

**If all files applied cleanly (`conflictFiles` and `skippedFiles` are empty):**
- List the files that were changed
- Remind the user to review the diff (`git diff`) and run the project's tests before committing
- Suggest a commit message, e.g. `chore: apply template change from hmpps-template-typescript PR #679`

**If there are conflict files:**
- Name each conflicting file
- Explain that the file contains `<<<<<<<` / `=======` / `>>>>>>>` conflict markers
- Offer to open and help resolve each conflict by reading the file and suggesting how to merge the changes
- After resolution, remind them to run `git add <file>` before committing

**If there are skipped files:**
- Name each skipped file
- Explain that the patch could not be applied (the file may not exist or has diverged too far)
- Run `get-change-details.mjs` if you haven't already to understand what the change was trying to do, then apply it manually using the `edit` tool

**If `success` is `false`:**
- Show the `gitOutput` to help diagnose the problem
- Suggest running with `--dry-run` to preview what would happen

---

## Step 5: Applying multiple changes

If the user wants to apply multiple changes, apply them one at a time in order from oldest to newest (lowest PR number first) to minimise conflicts. Report the outcome of each before proceeding to the next, and pause if any conflicts need resolution.

---

## Notes and guidance

- **Always run the project's validation steps after applying changes.** For this repo: `npm run typecheck && npm run lint && npm run test`.
- **The patch may not apply perfectly.** This repo has diverged from the template. Conflicts and skips are normal — the skill is a starting point, not a guarantee of a clean apply.
- **Rate limiting:** The scripts use unauthenticated GitHub API calls. If you hit a rate limit (HTTP 403/429), wait a minute and try again, or set the `GITHUB_TOKEN` environment variable to authenticate.
- **Not all template changes are relevant.** Some changes (e.g. switching to Playwright) may not apply to a repo that has already made different choices. Always review the change description before applying.

