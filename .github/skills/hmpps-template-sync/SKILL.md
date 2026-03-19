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

Run the fetch-changelog script to retrieve the latest entries from the template changelog:

```bash
node .github/skills/hmpps-template-sync/scripts/fetch-changelog.mjs
```

This outputs a JSON array. Each entry has:
- `date` — when the change was made
- `title` — a short description of the change
- `description` — fuller details, including any breaking changes or migration notes
- `prNumbers` — the PR number(s) in the template repo

Display the list to the user as a numbered list in this format:

```
N. <date> — <title> (PR #<number>)
   <first sentence of description if helpful>
```

Ask the user which change(s) they'd like to apply. They can specify by number in the list, by PR number (e.g. "apply #679"), or by describing the change.

If the user asks to see more details about a specific entry before applying it, use the GitHub MCP server `get_pull_request` tool on `ministryofjustice/hmpps-template-typescript` to fetch the PR description and file list, and summarise it.

---

## Step 2: Apply a selected change

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
- `skippedFiles` — files where the patch couldn't be applied at all
- `success` — `true` if at least a partial apply succeeded
- `gitOutput` — raw output from git (if any errors occurred)

---

## Step 3: Report the outcome

After running the script, summarise the result clearly:

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
- Explain that the patch could not be applied at all (the file may not exist in this repo, or has diverged too far)
- Offer to look at what the template change was trying to do and help apply it manually by reading the PR diff via the GitHub MCP server

**If `success` is `false`:**
- Show the `gitOutput` to help diagnose the problem
- Suggest running with `--dry-run` to preview what would happen

---

## Step 4: Applying multiple changes

If the user wants to apply multiple changes, apply them one at a time in order from oldest to newest (lowest PR number first) to minimise conflicts. Report the outcome of each before proceeding to the next, and pause if any conflicts need resolution.

---

## Notes and guidance

- **Always run the project's validation steps after applying changes.** For this repo: `npm run typecheck && npm run lint && npm run test`.
- **The patch may not apply perfectly.** This repo has diverged from the template. Conflicts and skips are normal — the skill is a starting point, not a guarantee of a clean apply.
- **Rate limiting:** The scripts use unauthenticated GitHub API calls. If you hit a rate limit (HTTP 403/429), wait a minute and try again, or set the `GITHUB_TOKEN` environment variable to authenticate.
- **Not all template changes are relevant.** Some changes (e.g. switching to Playwright) may not apply to a repo that has already made different choices. Always review the change description before applying.
