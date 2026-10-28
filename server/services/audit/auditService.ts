import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { AuditEvent, AuditService as HmppsAuditService, SubjectType } from '@ministryofjustice/hmpps-audit-client'
import { User } from '../../@types/CvlUserDetails'
import { FoundComCase, Licence } from '../../@types/licenceApiClientTypes'
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
    const eventType = `VIEW_${policy.eventType}_ATTEMPT`
    const auditEvent = this.createAuditEvent(eventType, licence, requestId, user)
    await this.sendAuditEvent(policy.eventType, auditEvent)
  }

  async logPageViewSuccess(
    requestId: string,
    policy: AuditPolicy,
    licence: Licence | undefined,
    user: User,
  ): Promise<void> {
    const eventType = `VIEW_${policy.eventType}_SUCCESS`
    const auditEventMessage = this.createAuditEvent(eventType, licence, requestId, user)
    await this.sendAuditEvent(policy.eventType, auditEventMessage)
  }

  async logProbationSearchEvent(
    requestId: string,
    searchTerm: string,
    searchResults: FoundComCase[],
    user: User,
  ): Promise<void> {
    const searchResultsSubjectIds = searchResults.map(result => result.crn)
    const baseEventMessage = this.createAuditEvent('SEARCH_PROBATION_SEARCH_SUCCESS', undefined, requestId, user)
    const auditEvent: AuditEvent = {
      ...baseEventMessage,
      subjectType: 'SEARCH_TERM',
      subjectId: searchTerm,
      details: {
        ...baseEventMessage.details,
        results: {
          resultCount: searchResults.length,
          returnedSubjectIds: searchResultsSubjectIds,
        },
      },
    }
    await this.sendAuditEvent('PROBATION_SEARCH', auditEvent)
  }

  private async sendAuditEvent(eventType: string, auditEvent: AuditEvent): Promise<void> {
    if (config.sqs.audit.enabled) {
      logger.info(`sending audit event type: ${eventType}`)
      telemetry.setSpanAttributes({ audited: true })

      try {
        await this.hmppsAuditService.logAuditEvent(auditEvent)
      } catch (error) {
        logger.error('Could not send audit event to hmpps audit service', error)
      }
    }
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
  ): { subjectType: SubjectType; subjectId: string } {
    if (licence) {
      if (user?.authSource === 'delius') {
        return {
          subjectType: 'CRN',
          subjectId: licence.crn,
        }
      }
      return {
        subjectType: 'PRISONER_ID',
        subjectId: licence.nomsId,
      }
    }

    return {
      subjectType: 'NOT_APPLICABLE',
      subjectId: '',
    }
  }
}
