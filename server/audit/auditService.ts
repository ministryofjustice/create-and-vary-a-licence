import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { User } from '../@types/CvlUserDetails'
import applicationInfo from '../applicationInfo'
import { Licence } from '../@types/licenceApiClientTypes'
import logger from '../../logger'

type AuditMessage = {
  what: string
  when: string
  subjectType: string
  subjectId: string
  correlationId: string
  who: string
  service: string
  details: object
}

export default class AuditService {
  async recordAuditEvent(
    requestId: string,
    eventType: string,
    licence: Licence | undefined,
    user: User,
  ): Promise<void> {
    const auditEventMessage = this.createAuditEventMessage(eventType, licence, requestId, user)
    this.sendAuditEventMessage(eventType, auditEventMessage)
  }

  async recordProbationSearchAuditEvent(requestId: string, searchResults: object, user: User): Promise<void> {
    const baseEventMessage = this.createAuditEventMessage('PROBATION_SEARCH', undefined, requestId, user)
    const auditEventMessage: AuditMessage = {
      ...baseEventMessage,
      details: {
        ...baseEventMessage.details,
        searchResults,
      },
    }
    this.sendAuditEventMessage('PROBATION_SEARCH', auditEventMessage)
  }

  private sendAuditEventMessage(eventType: string, auditData: object): void {
    telemetry.setSpanAttributes({ audited: true })

    logger.info(`sending audit event: ${eventType}`)
    logger.info(`audit event data: ${JSON.stringify(auditData)}`)
    // TODO: send audit message
  }

  private createAuditEventMessage(
    eventType: string,
    licence: Licence | undefined,
    requestId: string,
    user: User,
  ): AuditMessage {
    return {
      what: eventType,
      when: new Date().toISOString(),
      subjectType: 'LICENCE', // or OFFENDER, LICENCE, etc
      subjectId: licence && this.getSubjectIdFromRequest(licence, user),
      correlationId: requestId,
      who: user.username,
      service: applicationInfo().applicationName,
      details: {
        build: applicationInfo().gitRef,
        userRoles: user.userRoles,
      },
    }
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
