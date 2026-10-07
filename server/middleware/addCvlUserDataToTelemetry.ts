import type { RequestHandler } from 'express'
import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'

export default function addCvlUserDataToTelemetry(): RequestHandler {
  return (req, res, next) => {
    const { user } = res.locals

    if (user) {
      telemetry.setSpanAttributes({
        ...(user.username && { username: user.username }),
        ...(user.authSource && { authSource: user.authSource }),
        ...(user.displayName && { displayName: user.displayName }),
        ...(user.reportUserId && { userId: user.reportUserId }),
        ...(typeof user.nomisStaffId === 'number' && { nomisStaffId: user.nomisStaffId }),
        ...(user.activeCaseload && { activeCaseLoadId: user.activeCaseload }),
        ...(user.prisonCaseload?.length && { prisonCaseload: user.prisonCaseload.join(',') }),
        ...(typeof user.deliusStaffIdentifier === 'number' && {
          deliusStaffIdentifier: user.deliusStaffIdentifier,
        }),
        ...(user.deliusStaffCode && { deliusStaffCode: user.deliusStaffCode }),
        ...(typeof user.isProbationUser === 'boolean' && { isProbationUser: user.isProbationUser }),
        ...(user.probationAreaCode && { probationAreaCode: user.probationAreaCode }),
        ...(user.probationPduCodes?.length && { probationPduCodes: user.probationPduCodes.join(',') }),
        ...(user.probationLauCodes?.length && { probationLauCodes: user.probationLauCodes.join(',') }),
        ...(user.probationTeamCodes?.length && { probationTeamCodes: user.probationTeamCodes.join(',') }),
      })
    }

    return next()
  }
}
