import { setup, defaultClient, TelemetryClient, DistributedTracingModes, Contracts } from 'applicationinsights'
import type FlushOptions from 'applicationinsights/out/Library/FlushOptions'
import type { User } from '../@types/CvlUserDetails'
import type { ApplicationInfo } from '../applicationInfo'

type TelemetryProcessor = Parameters<typeof TelemetryClient.prototype.addTelemetryProcessor>[0]

export function initialiseAppInsights(applicationInfo: ApplicationInfo): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
    defaultClient.context.tags['ai.cloud.role'] = applicationInfo.applicationName
    defaultClient.context.tags['ai.application.ver'] = applicationInfo.buildNumber
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
    return defaultClient
  }
  return null
}

export function flush(options: FlushOptions, exitMessage: string): void {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    defaultClient.flush(options)
  } else if (options.callback) {
    options.callback(exitMessage)
  }
}

export const addUserDataToRequests: TelemetryProcessor = (envelope, contextObjects) => {
  const isRequest = envelope.data.baseType === Contracts.TelemetryTypeString.Request
  if (isRequest) {
    const user = contextObjects?.['http.ServerRequest']?.res?.locals?.user
    if (user) {
      const { properties } = envelope.data.baseData

      envelope.data.baseData.properties = { ...getUserDetails(user), ...properties }
    }
  }
  return true
}

const getUserDetails = (user: User) => {
  const {
    displayName,
    nomisStaffId,
    prisonCaseload,
    username,
    prisonCaseload: activeCaseLoadId,
    deliusStaffIdentifier,
    deliusStaffCode,
    probationAreaCode,
    probationPduCodes,
    probationLauCodes,
    probationTeamCodes,
  } = user

  if (user.nomisStaffId) {
    return { displayName, nomisStaffId, prisonCaseload, username, activeCaseLoadId }
  }
  if (user.deliusStaffCode) {
    return {
      displayName,
      deliusStaffIdentifier,
      deliusStaffCode,
      probationAreaCode,
      probationPduCodes,
      probationLauCodes,
      probationTeamCodes,
    }
  }
  return { displayName }
}
