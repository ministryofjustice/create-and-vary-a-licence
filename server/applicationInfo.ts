import fs from 'fs'
import config from './config'

const {
  packageData: { name: applicationName },
} = JSON.parse(fs.readFileSync('../package.json').toString())

const { buildNumber, gitRef } = config

export default { applicationName, buildNumber, gitRef, gitShortHash: gitRef.substring(0, 7) }
