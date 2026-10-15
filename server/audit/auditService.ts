import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { User } from '../@types/CvlUserDetails'
import applicationInfo from '../applicationInfo'
import { Licence } from '../@types/licenceApiClientTypes'
import logger from '../../logger'

export default class AuditService {
  async recordAuditEvent(requestId: string, event: string, licence: Licence | undefined, user: User): Promise<void> {
    const auditData = {
      what: event,
      when: new Date().toISOString(),
      // operationId: 'dozdi57zFcTfTwkr511FRviCRGAOav1b', // Not required and from a search of Github, I can't see anyone else populating this
      subjectId: this.getSubjectIdFromRequest(licence, user),
      subjectType: 'LICENCE', // or OFFENDER, LICENCE, etc
      correlationId: requestId,
      who: user.username,
      service: applicationInfo().applicationName,
      details: {
        build: applicationInfo().gitRef,
        userRoles: user.userRoles,
      },
    }

    telemetry.setSpanAttributes({ audited: true })

    logger.info(`audit event: ${event}`)
    logger.info(`audit event data: ${JSON.stringify(auditData)}`)
    // TODO: send audit message
  }

  async recordProbationSearchAuditEvent(
    requestId: string,
    event: string,
    searchResults: object,
    user: User,
  ): Promise<void> {
    logger.info(
      `recordProbationSearchAuditEvent: ${event} for user ${user.username} with requestId ${requestId}, searchResults: ${JSON.stringify(searchResults)}`,
    )
  }

  private getSubjectIdFromRequest(licence: Licence | undefined, user: User): string {
    if (licence) {
      if (user?.nomisStaffId) {
        return licence.nomsId
      }

      if (user?.deliusStaffIdentifier) {
        return licence.crn
      }
    }
    return '' // TODO: any other possible subjectId sources?
  }
}
