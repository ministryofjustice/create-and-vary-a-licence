import { setup, defaultClient, type TelemetryClient, DistributedTracingModes } from 'applicationinsights'

import type { User } from '../@types/CvlUserDetails'
import type { ApplicationInfo } from '../applicationInfo'

type TelemetryProcessor = Parameters<typeof TelemetryClient.prototype.addTelemetryProcessor>[0]
type FlushOptions = {
  isAppCrashing?: boolean
  callback?: (message: string) => void
}

export function initialiseAppInsights(applicationInfo: ApplicationInfo): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
    defaultClient.context.tags['ai.cloud.role'] = applicationInfo.applicationName
    defaultClient.context.tags['ai.application.ver'] = applicationInfo.buildNumber
    defaultClient.addTelemetryProcessor(addUserDataToRequests)
    defaultClient.addTelemetryProcessor(overrideOperationName)
    return defaultClient
  }
  return null
}

export async function flush(options: FlushOptions, exitMessage: string): Promise<void> {
  if (process.env.APPINSIGHTS_INSTRUMENTATIONKEY) {
    await defaultClient.flush()
    options.callback?.(exitMessage)
  } else if (options.callback) {
    options.callback(exitMessage)
  }
}

export const addUserDataToRequests: TelemetryProcessor = (envelope, contextObjects) => {
  const { data } = envelope
  const isRequest = data.baseType === 'RequestData'
  if (isRequest) {
    const user = contextObjects?.['http.ServerRequest']?.res?.locals?.user
    if (user) {
      const { properties } = data.baseData

      envelope.data.baseData.properties = { ...getUserDetails(user), ...properties }
    }
  }
  return true
}

export const overrideOperationName: TelemetryProcessor = (envelope, contextObjects) => {
  const { tags, data } = envelope
  const operationNameOverride = contextObjects.correlationContext?.customProperties?.getProperty('operationName')
  if (operationNameOverride) {
    tags['ai.operation.name'] = operationNameOverride
    data.baseData.name = operationNameOverride
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
    return { type: 'PRISON', displayName, nomisStaffId, prisonCaseload, username, activeCaseLoadId }
  }
  if (user.deliusStaffCode) {
    return {
      type: 'PROBATION',
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
