#!/usr/bin/env node
/**
 * Fetches and parses the CHANGELOG.md from hmpps-template-typescript.
 *
 * Usage: node fetch-changelog.mjs [--limit <n>]
 *
 * Outputs a JSON array of changelog entries to stdout:
 *   [{ date, title, description, prNumbers }, ...]
 */

const CHANGELOG_URL =
  'https://raw.githubusercontent.com/ministryofjustice/hmpps-template-typescript/main/CHANGELOG.md'

const args = process.argv.slice(2)
const limitIndex = args.indexOf('--limit')
const limit = limitIndex !== -1 ? parseInt(args[limitIndex + 1], 10) : null

async function fetchChangelog() {
  const response = await fetch(CHANGELOG_URL)
  if (!response.ok) {
    throw new Error(`Failed to fetch changelog: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

/**
 * Parses CHANGELOG.md into structured entries.
 *
 * Each entry starts with a bold date+title line:
 *   **Month Nth Year** - Title text
 *
 * Followed by optional description paragraphs and one or more PR links:
 *   See PR [#123](https://github.com/...pull/123)
 */
function parseChangelog(markdown) {
  const entries = []

  // Split on bold date headings — each entry begins with **<date>** - <title>
  const sections = markdown.split(/(?=\*\*\w+ \d+(?:st|nd|rd|th) \d{4}\*\*)/)

  for (const section of sections) {
    const trimmed = section.trim()
    if (!trimmed) continue

    // Match the heading: **February 26th 2026** - Title here
    const headingMatch = trimmed.match(/^\*\*([^*]+)\*\*\s*[-–]\s*(.+)/)
    if (!headingMatch) continue

    const date = headingMatch[1].trim()
    const title = headingMatch[2].trim()

    // Everything after the heading line is the description
    const afterHeading = trimmed.slice(headingMatch[0].length).trim()

    // Extract all PR numbers and URLs from links like [#123](https://github.com/.../pull/123)
    const prNumbers = []
    const prUrls = []
    const prRegex = /\[#(\d+)\]\((https:\/\/github\.com\/ministryofjustice\/hmpps-template-typescript\/pull\/(\d+))\)/g
    let prMatch
    // eslint-disable-next-line no-cond-assign
    while ((prMatch = prRegex.exec(afterHeading)) !== null) {
      const prNum = parseInt(prMatch[1], 10)
      if (!prNumbers.includes(prNum)) {
        prNumbers.push(prNum)
        prUrls.push(prMatch[2])
      }
    }

    // Build description: strip the PR links and "See PR" lines, clean up whitespace
    const description = afterHeading
      .split('\n')
      .filter(line => !/^See PR\s/i.test(line.trim()))
      .join('\n')
      .replace(/\[#\d+\]\([^)]+\)/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim()

    entries.push({ date, title, description, prNumbers, prUrls })
  }

  return entries
}

try {
  const markdown = await fetchChangelog()
  const entries = parseChangelog(markdown)
  const result = limit ? entries.slice(0, limit) : entries
  process.stdout.write(JSON.stringify(result, null, 2))
  process.stdout.write('\n')
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n`)
  process.exit(1)
}
