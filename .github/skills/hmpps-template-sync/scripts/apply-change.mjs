#!/usr/bin/env node
/**
 * Downloads a PR's diff from hmpps-template-typescript and applies it to the
 * current working directory using `git apply --3way`.
 *
 * Usage: node apply-change.mjs <pr-number> [--dry-run]
 *
 * Options:
 *   --dry-run   Show what would be applied without making changes
 *
 * Outputs a JSON result to stdout:
 *   { prNumber, appliedFiles, conflictFiles, skippedFiles, success }
 */

import { execSync, spawnSync } from 'node:child_process'
import { mkdtemp, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const TEMPLATE_REPO = 'ministryofjustice/hmpps-template-typescript'

const args = process.argv.slice(2)
const prNumber = args.find(a => /^\d+$/.test(a))
const isDryRun = args.includes('--dry-run')

if (!prNumber) {
  process.stderr.write('Usage: node apply-change.mjs <pr-number> [--dry-run]\n')
  process.exit(1)
}

async function fetchPrDiff(pr) {
  const url = `https://api.github.com/repos/${TEMPLATE_REPO}/pulls/${pr}`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github.v3.diff',
      'User-Agent': 'hmpps-template-sync-skill',
    },
  })
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`PR #${pr} not found in ${TEMPLATE_REPO}`)
    }
    throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
  }
  return response.text()
}

async function fetchPrFiles(pr) {
  const url = `https://api.github.com/repos/${TEMPLATE_REPO}/pulls/${pr}/files?per_page=100`
  const response = await fetch(url, {
    headers: {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'hmpps-template-sync-skill',
    },
  })
  if (!response.ok) {
    throw new Error(`Failed to fetch PR files: ${response.status} ${response.statusText}`)
  }
  return response.json()
}

function applyDiff(patchPath, dryRun) {
  const gitArgs = ['apply', '--3way', '--whitespace=nowarn']
  if (dryRun) gitArgs.push('--check')
  gitArgs.push(patchPath)

  const result = spawnSync('git', gitArgs, {
    cwd: process.cwd(),
    encoding: 'utf8',
  })

  return {
    exitCode: result.status,
    stdout: result.stdout || '',
    stderr: result.stderr || '',
  }
}

function classifyOutcome(gitResult, prFiles) {
  const appliedFiles = []
  const conflictFiles = []
  const skippedFiles = []

  if (gitResult.exitCode === 0) {
    // All applied cleanly
    for (const file of prFiles) {
      appliedFiles.push(file.filename)
    }
    return { appliedFiles, conflictFiles, skippedFiles }
  }

  const stderr = gitResult.stderr

  // Files with patch failures (can't apply at all)
  const patchFailPattern = /^error: patch failed: (.+):\d+/gm
  const doesNotApplyPattern = /^error: ([^:]+): patch does not apply/gm
  const notInIndexPattern = /^error: ([^:]+): does not exist in index/gm

  const problemFiles = new Set()
  let m

  // eslint-disable-next-line no-cond-assign
  while ((m = patchFailPattern.exec(stderr)) !== null) problemFiles.add(m[1])
  // eslint-disable-next-line no-cond-assign
  while ((m = doesNotApplyPattern.exec(stderr)) !== null) problemFiles.add(m[1])
  // eslint-disable-next-line no-cond-assign
  while ((m = notInIndexPattern.exec(stderr)) !== null) problemFiles.add(m[1])

  // Files that applied with conflicts (3-way merge produced conflict markers)
  // git outputs: "Applied patch <file> with conflicts."
  const conflictAppliedPattern = /^Applied patch (.+) with conflicts\./gm
  const conflictsByThreeWay = new Set()
  // eslint-disable-next-line no-cond-assign
  while ((m = conflictAppliedPattern.exec(stderr)) !== null) conflictsByThreeWay.add(m[1])

  for (const file of prFiles) {
    const filename = file.filename
    if (conflictsByThreeWay.has(filename)) {
      conflictFiles.push(filename)
    } else if (problemFiles.has(filename)) {
      skippedFiles.push(filename)
    } else {
      // Not mentioned in errors — assume applied cleanly
      appliedFiles.push(filename)
    }
  }

  return { appliedFiles, conflictFiles, skippedFiles }
}

let tmpDir = null
try {
  const diff = await fetchPrDiff(prNumber)
  const prFiles = await fetchPrFiles(prNumber)

  if (!diff.trim()) {
    const result = {
      prNumber: parseInt(prNumber, 10),
      appliedFiles: [],
      conflictFiles: [],
      skippedFiles: [],
      success: true,
      message: 'PR has no file changes to apply.',
    }
    process.stdout.write(JSON.stringify(result, null, 2))
    process.stdout.write('\n')
    process.exit(0)
  }

  tmpDir = await mkdtemp(join(tmpdir(), 'hmpps-template-sync-'))
  const patchFile = join(tmpDir, `pr-${prNumber}.patch`)
  await writeFile(patchFile, diff, 'utf8')

  const gitResult = applyDiff(patchFile, isDryRun)
  const { appliedFiles, conflictFiles, skippedFiles } = classifyOutcome(gitResult, prFiles)

  const success = gitResult.exitCode === 0 || conflictFiles.length > 0
  const result = {
    prNumber: parseInt(prNumber, 10),
    dryRun: isDryRun,
    appliedFiles,
    conflictFiles,
    skippedFiles,
    success,
    ...(gitResult.stderr.trim() && { gitOutput: gitResult.stderr.trim() }),
  }

  process.stdout.write(JSON.stringify(result, null, 2))
  process.stdout.write('\n')

  if (!success) process.exit(1)
} catch (err) {
  process.stderr.write(`Error: ${err.message}\n`)
  process.exit(1)
} finally {
  if (tmpDir) {
    await rm(tmpDir, { recursive: true, force: true })
  }
}
