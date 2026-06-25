# HMPPS Template Sync Skill

A GitHub Copilot skill that helps you keep this repository in sync with changes from the [hmpps-template-typescript](https://github.com/ministryofjustice/hmpps-template-typescript) shared template.

The template maintainers publish a changelog at the template repository. Each entry links to the GitHub pull request (PR) that introduced the change. This skill fetches those diffs and applies them using `git apply --3way`.

---

## Example usage

You can trigger this skill by asking Copilot in plain English. Here are some examples:

### List available template changes

```
What template changes are available?
```

```
Show me the latest updates from the hmpps-template-typescript template.
```

```
List the first 10 template changes.
```

Copilot will display a numbered list of changes, each with a date, title, PR number, and a short description.

---

### Inspect a specific change before applying it

```
Tell me more about change #5.
```

```
What does PR #679 change?
```

```
Show me the details of the "upgrade govuk-frontend" change.
```

Copilot will show the PR title, description, merge date, and a breakdown of which files were changed.

---

### Apply a change

```
Apply change #5.
```

```
Apply template PR #679.
```

```
Sync the ESLint config update from the template.
```

Copilot will download the PR's diff and apply it using `git apply --3way`. It'll then summarise what happened:

- **Files applied cleanly** — no action needed; review the diff and run the tests
- **Files with conflicts** — the file will contain `<<<<<<<` / `=======` / `>>>>>>>` markers; Copilot can help you resolve them
- **Skipped files** — the patch couldn't be applied (the file may be missing or has diverged too far); Copilot will inspect the PR diff to understand the intent and attempt to apply the change manually using its edit tools

---

### Preview a change without modifying files

```
Do a dry run of PR #679.
```

```
Preview what applying change #3 would do, without making any changes.
```

---

### Apply multiple changes

```
Apply changes #3, #5, and #7.
```

```
Apply all template changes from the past month.
```

Copilot applies changes one at a time, oldest first, and pauses if any conflicts need resolving before continuing.

---

## After applying a change

Always validate the repository after syncing:

```bash
npm run typecheck && npm run lint && npm run test
```

If everything passes, commit with a message like:

```
chore: apply template change from hmpps-template-typescript PR #679
```

---

## Notes

- **Conflicts are normal.** This repository has diverged from the template, so not every patch will apply cleanly. The skill is a starting point, not a guarantee.
- **Not all changes are relevant.** Review the change description before applying — some template changes may not be appropriate for this repo.
- **Rate limiting.** The skill uses unauthenticated GitHub API calls. If you hit a rate limit (HTTP 403 or 429), wait a minute and try again, or set the `GITHUB_TOKEN` environment variable.

---

## Scripts

The underlying scripts are in `.github/skills/hmpps-template-sync/scripts/` and can also be run directly:

| Script | Purpose |
|---|---|
| `list-changes.mjs` | Fetches and displays the template changelog |
| `get-change-details.mjs <pr>` | Shows details for a specific PR |
| `apply-change.mjs <pr>` | Downloads and applies a PR's diff |
| `fetch-changelog.mjs` | Internal helper; parses the raw changelog |
