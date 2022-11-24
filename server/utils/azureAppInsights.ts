import { setup, defaultClient, TelemetryClient, DistributedTracingModes, Contracts } from 'applicationinsights'
import FlushOptions from 'applicationinsights/out/Library/FlushOptions'
import CvlUserDetails from '../@types/CvlUserDetails'
import applicationVersion from '../applicationVersion'

type TelemetryProcessor = Parameters<typeof TelemetryClient.prototype.addTelemetryProcessor>[0]

function defaultName(): string {
  const {
    packageData: { name },
  } = applicationVersion
  return name
}

function version(): string {
  const { buildNumber } = applicationVersion
  return buildNumber
}

export function initialiseAppInsights(): void {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    // eslint-disable-next-line no-console
    console.log('Enabling azure application insights')

    setup().setDistributedTracingMode(DistributedTracingModes.AI_AND_W3C).start()
  }
}

export function buildAppInsightsClient(name = defaultName()): TelemetryClient {
  if (process.env.APPLICATIONINSIGHTS_CONNECTION_STRING) {
    defaultClient.context.tags['ai.cloud.role'] = name
    defaultClient.context.tags['ai.application.ver'] = version()
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
      // eslint-disable-next-line no-param-reassign
      envelope.data.baseData.properties = { ...getUserDetails(user), ...properties }
    }
  }
  return true
}

const getUserDetails = (user: CvlUserDetails) => {
  const {
    displayName,
    nomisStaffId,
    prisonCaseload,
    deliusStaffIdentifier,
    deliusStaffCode,
    probationAreaCode,
    probationPduCodes,
    probationLauCodes,
    probationTeamCodes,
  } = user

  if (user.nomisStaffId) {
    return { displayName, nomisStaffId, prisonCaseload }
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
