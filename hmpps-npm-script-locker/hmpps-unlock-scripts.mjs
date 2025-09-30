#!/usr/bin/env node

import fs from 'fs'
import npmRunScript from '@npmcli/run-script'

const CONFIG_LOCATION = '../.allowed-scripts.mjs'
const packageLockJson = JSON.parse(fs.readFileSync('package-lock.json', 'utf-8'))

console.log(`Gathering configuration information from ${CONFIG_LOCATION}\n`)

const configuredAllowlistModule = await import(CONFIG_LOCATION)
const configuredAllowlist = Object.entries(Object.assign({}, configuredAllowlistModule).default)

const packagesWithScripts = Object.entries(packageLockJson.packages)
  .map(([name, { version, hasInstallScript }]) => ({ name, version, hasInstallScript }))
  .filter(pkg => pkg.hasInstallScript)
  .map(pkg => ({ ...pkg, nameWithVersion: `${pkg.name}@${pkg.version}` }))
  .map(pkg => {
    const configuredPackage = configuredAllowlist.find(([name]) => pkg.nameWithVersion === name)
    const isConfigured = Boolean(configuredPackage)
    return { ...pkg, configured: isConfigured, status: isConfigured ? configuredPackage[1] : '<MISSING>' }
  })

const configToPrint = Object.fromEntries(packagesWithScripts.map(pkg => [pkg.nameWithVersion, pkg.status]))

console.log(`Current configuration: ${JSON.stringify(configToPrint, null, 2)}\n`)

const missingPackages = packagesWithScripts.filter(pkg => !pkg.configured).map(pkg => pkg.nameWithVersion)
if (missingPackages.length) {
  console.log(`ERROR: Explicitly configure the following in ${CONFIG_LOCATION}:\n  ${missingPackages.join('\n  ')}`)
  process.exit(1)
}

const allowed = packagesWithScripts.filter(pkg => pkg.status === 'RUN').map(pkg => pkg.name)
if (!allowed.length) {
  console.log(`No scripts to run`)
  process.exit(0)
}

for (const pkg of allowed) {
  console.log(`- Running scripts for: ${pkg}`)
  await runScript({ path: pkg, event: 'preinstall' })
  await runScript({ path: pkg, event: 'install' })
  await runScript({ path: pkg, event: 'postinstall' })
}

console.log('Running local scripts')
await runScript({ event: 'install', path: '.' })
await runScript({ event: 'postinstall', path: '.' })
await runScript({ event: 'prepublish', path: '.' })

console.log('FIN!')

async function runScript({ path, event }) {
  await npmRunScript({ event, path, stdio: 'inherit' })
}
