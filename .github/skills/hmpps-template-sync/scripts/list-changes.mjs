#!/usr/bin/env node
/**
 * Fetches the hmpps-template-typescript changelog and prints a formatted numbered list.
 *
 * Usage: node list-changes.mjs [--limit <n>] [--from <n>]
 *
 * Options:
 *   --limit <n>   Maximum number of entries to show (default: all)
 *   --from <n>    Start from entry number N (1-based, default: 1)
 *
 * Outputs a human-readable numbered list to stdout, ready to display to the user.
 */

import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Re-use the fetch-changelog logic by importing its parsed output via a subprocess
import { spawnSync } from 'node:child_process'

const args = process.argv.slice(2)

const limitIndex = args.indexOf('--limit')
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null

const fromIndex = args.indexOf('--from')
const from = fromIndex !== -1 ? Math.max(1, parseInt(args[fromIndex + 1], 10)) : 1

const fetchScript = join(__dirname, 'fetch-changelog.mjs')
const result = spawnSync(process.execPath, [fetchScript], { encoding: 'utf8' })

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Failed to fetch changelog\n')
  process.exit(1)
}

let entries
try {
  entries = JSON.parse(result.stdout)
} catch {
  process.stderr.write('Failed to parse changelog JSON\n')
  process.exit(1)
}

const fromIdx = from - 1
const slice = limit ? entries.slice(fromIdx, fromIdx + limit) : entries.slice(fromIdx)

if (slice.length === 0) {
  process.stdout.write(`No entries found starting from #${from}.\n`)
  process.exit(0)
}

for (const [i, entry] of slice.entries()) {
  const num = String(fromIdx + i + 1).padStart(2)
  const prTags = entry.prNumbers.length ? entry.prNumbers.map(n => `#${n}`).join(', ') : null
  const header = `${num}. ${entry.date} — ${entry.title}${prTags ? ` (${prTags})` : ''}`

  process.stdout.write(`${header}\n`)

  // Print PR URLs
  for (const url of entry.prUrls) {
    process.stdout.write(`    ${url}\n`)
  }

  // Print first sentence of description as a hint, if it's concise
  if (entry.description) {
    const firstLine = entry.description
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // strip markdown links
      .split('\n')[0]
      .split('. ')[0]
      .trim()
    if (firstLine.length > 5 && firstLine.length <= 120) {
      process.stdout.write(`    ${firstLine}\n`)
    }
  }

  process.stdout.write('\n')
}

const totalShown = fromIdx + slice.length
const remaining = entries.length - totalShown
if (remaining > 0) {
  process.stdout.write(`... (${remaining} older entries — run with --from ${totalShown + 1} to see more)\n`)
}
