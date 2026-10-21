import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { AuditEvent, AuditService as HmppsAuditService, SubjectType } from '@ministryofjustice/hmpps-audit-client'
import { User } from '../../@types/CvlUserDetails'
import { Licence } from '../../@types/licenceApiClientTypes'
import logger from '../../../logger'
import { AuditPolicy } from './routeAuditPolicy'
import config from '../../config'

export default class AuditService {
  constructor(private readonly hmppsAuditService: HmppsAuditService) {}

  async logPageViewAttempt(
    requestId: string,
    policy: AuditPolicy,
    licence: Licence | undefined,
    user: User,
  ): Promise<void> {
    const eventType = `PAGE_VIEW_${policy.eventType}_ATTEMPT`
    const auditEvent = this.createAuditEvent(eventType, licence, requestId, user)
    await this.sendAuditEvent(policy.eventType, auditEvent)
  }

  async logPageViewSuccess(
    requestId: string,
    policy: AuditPolicy,
    licence: Licence | undefined,
    user: User,
  ): Promise<void> {
    const eventType = `PAGE_VIEW_${policy.eventType}_SUCCESS`
    const auditEventMessage = this.createAuditEvent(eventType, licence, requestId, user)
    await this.sendAuditEvent(policy.eventType, auditEventMessage)
  }

  async recordProbationSearchAuditEvent(requestId: string, searchResults: object, user: User): Promise<void> {
    const baseEventMessage = this.createAuditEvent('PROBATION_SEARCH', undefined, requestId, user)
    const auditEvent: AuditEvent = {
      ...baseEventMessage,
      details: {
        ...baseEventMessage.details,
        searchResults,
      },
    }
    await this.sendAuditEvent('PROBATION_SEARCH', auditEvent)
  }

  private async sendAuditEvent(eventType: string, auditEvent: AuditEvent): Promise<void> {
    logger.info(`sending audit event type: ${eventType}, data: ${JSON.stringify(auditEvent)}`)
    telemetry.setSpanAttributes({ audited: true })
    await this.hmppsAuditService.logAuditEvent(auditEvent)
  }

  private createAuditEvent(eventType: string, licence: Licence | undefined, requestId: string, user: User): AuditEvent {
    const { subjectType, subjectId } = this.getSubjectFromRequest(licence, user)
    return {
      what: eventType,
      subjectType,
      subjectId,
      correlationId: requestId,
      who: user.username,
      details: {
        build: config.gitRef,
        userRoles: user.userRoles,
      },
    }
  }

  private getSubjectFromRequest(
    licence: Licence | undefined,
    user: User,
  ): { subjectType: SubjectType; subjectId: string } | undefined {
    if (licence) {
      if (user?.nomisStaffId) {
        return {
          subjectType: 'PRISONER_ID',
          subjectId: licence.nomsId,
        }
      }
    }

    if (user?.deliusStaffIdentifier) {
      return {
        subjectType: 'CRN',
        subjectId: licence.crn,
      }
    }

    // TODO : do we have any other subject types we can use here when licence is not availabe?
    return {
      subjectType: 'NOT_APPLICABLE',
      subjectId: '',
    }
  }
}
