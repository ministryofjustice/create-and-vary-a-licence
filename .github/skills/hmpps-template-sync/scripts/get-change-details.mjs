#!/usr/bin/env node
/**
 * Fetches and formats details for a specific PR from hmpps-template-typescript.
 *
 * Usage: node get-change-details.mjs <pr-number>
 *
 * Outputs human-readable PR details to stdout including:
 *   - PR title, URL, and merge date
 *   - Full description
 *   - List of changed files with their change type and line counts
 */

const TEMPLATE_REPO = 'ministryofjustice/hmpps-template-typescript'
const BASE_URL = `https://api.github.com/repos/${TEMPLATE_REPO}`
const PR_URL = `https://github.com/${TEMPLATE_REPO}/pull`

const args = process.argv.slice(2)
const prNumber = args.find(a => /^\d+$/.test(a))

if (!prNumber) {
  process.stderr.write('Usage: node get-change-details.mjs <pr-number>\n')
  process.exit(1)
}

const headers = {
  Accept: 'application/vnd.github+json',
  'User-Agent': 'hmpps-template-sync-skill',
  ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
}

async function githubGet(path) {
  const response = await fetch(`${BASE_URL}${path}`, { headers })
  if (!response.ok) {
    if (response.status === 404) throw new Error(`PR #${prNumber} not found`)
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

try {
  const [pr, files] = await Promise.all([
    githubGet(`/pulls/${prNumber}`),
    githubGet(`/pulls/${prNumber}/files?per_page=100`),
  ])

  const mergedAt = pr.merged_at ? new Date(pr.merged_at).toDateString() : 'not merged'

  process.stdout.write(`## PR #${prNumber} — ${pr.title}\n`)
  process.stdout.write(`${PR_URL}/${prNumber}\n`)
  process.stdout.write(`Merged: ${mergedAt}\n\n`)

  if (pr.body) {
    // Strip HTML comments and trim
    const body = pr.body.replace(/<!--[\s\S]*?-->/g, '').trim()
    if (body) {
      process.stdout.write(`### Description\n\n${body}\n\n`)
    }
  }

  if (files.length > 0) {
    process.stdout.write(`### Files changed (${files.length})\n\n`)
    for (const file of files) {
      const status = {
        added: '+ added',
        removed: '- removed',
        modified: '~ modified',
        renamed: '→ renamed',
        copied: '⊕ copied',
      }[file.status] || file.status

      const stats = [
        file.additions > 0 ? `+${file.additions}` : null,
        file.deletions > 0 ? `-${file.deletions}` : null,
      ]
        .filter(Boolean)
        .join(' ')

      const name = file.previous_filename ? `${file.previous_filename} → ${file.filename}` : file.filename
      process.stdout.write(`  ${status.padEnd(12)} ${name}${stats ? `  (${stats})` : ''}\n`)
    }
  }
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n`)
  process.exit(1)
}
