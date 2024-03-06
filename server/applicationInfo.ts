import fs from 'fs'
import path from 'path'
import config from './config'

const { buildNumber, gitRef, productId, branchName } = config

export type ApplicationInfo = {
  applicationName: string
  buildNumber: string
  gitRef: string
  gitShortHash: string
  productId?: string
  branchName: string
}

const getNameFromPackageJson = () => {
  const packageJson = path.join(__dirname, '../../package.json')
  const { name } = JSON.parse(fs.readFileSync(packageJson).toString())
  return name
}

export default (overrideName?: string): ApplicationInfo => {
  return {
    applicationName: overrideName || getNameFromPackageJson(),
    buildNumber,
    gitRef,
    gitShortHash: gitRef.substring(0, 7),
    productId,
    branchName,
  }
}
