import { telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { AuditEvent, AuditService as HmppsAuditService, SubjectType } from '@ministryofjustice/hmpps-audit-client'
import { User } from '../../@types/CvlUserDetails'
import {
  ApproverSearchResponse,
  FoundComCase,
  Licence,
  PrisonCaseAdminSearchResult,
  VaryApproverCaseloadSearchResponse,
} from '../../@types/licenceApiClientTypes'
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
    const eventType = `${policy.eventType}_ATTEMPT`
    const auditEvent = this.createAuditEvent(eventType, licence, requestId, user)
    await this.sendAuditEvent(auditEvent)
  }

  async logPageViewSuccess(
    requestId: string,
    policy: AuditPolicy,
    licence: Licence | undefined,
    user: User,
  ): Promise<void> {
    const eventType = `${policy.eventType}_SUCCESS`
    const auditEventMessage = this.createAuditEvent(eventType, licence, requestId, user)
    await this.sendAuditEvent(auditEventMessage)
  }

  async logProbationSearchEvent(
    requestId: string,
    searchTerm: string,
    searchResults: FoundComCase[],
    user: User,
  ): Promise<void> {
    const searchResultsSubjectIds = searchResults.map(result => result.crn)
    const baseEventMessage = this.createAuditEvent('VIEW_PROBATION_SEARCH_RESULTS_SUCCESS', undefined, requestId, user)
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
    await this.sendAuditEvent(auditEvent)
  }

  async logCaSearchEvent(
    requestId: string,
    searchTerm: string,
    searchResults: PrisonCaseAdminSearchResult,
    user: User,
  ): Promise<void> {
    // const searchResultsSubjectIds = searchResults.map(result => result.crn)
    const inPrisonIds = searchResults.inPrisonResults.map(result => result.prisonerNumber)
    const probationIds = searchResults.onProbationResults.map(result => result.prisonerNumber)
    const attentionNeededIds = searchResults.attentionNeededResults.map(result => result.prisonerNumber)
    const searchResultsSubjectIds = inPrisonIds.concat(probationIds).concat(attentionNeededIds)

    const baseEventMessage = this.createAuditEvent('VIEW_CA_SEARCH_RESULTS_SUCCESS', undefined, requestId, user)
    const auditEvent: AuditEvent = {
      ...baseEventMessage,
      subjectType: 'SEARCH_TERM',
      subjectId: searchTerm,
      details: {
        ...baseEventMessage.details,
        results: {
          resultCount: searchResultsSubjectIds.length,
          returnedSubjectIds: searchResultsSubjectIds,
        },
      },
    }
    await this.sendAuditEvent(auditEvent)
  }

  async logApproverSearchEvent(
    requestId: string,
    searchTerm: string,
    searchResults: ApproverSearchResponse,
    user: User,
  ): Promise<void> {
    const approvedIds = searchResults.recentlyApprovedResponse.map(result => result.prisonerNumber)
    const needApprovalIds = searchResults.approvalNeededResponse.map(result => result.prisonerNumber)
    const searchResultsSubjectIds = approvedIds.concat(needApprovalIds)

    const baseEventMessage = this.createAuditEvent('VIEW_APPROVER_SEARCH_RESULTS_SUCCESS', undefined, requestId, user)
    const auditEvent: AuditEvent = {
      ...baseEventMessage,
      subjectType: 'SEARCH_TERM',
      subjectId: searchTerm,
      details: {
        ...baseEventMessage.details,
        results: {
          resultCount: searchResultsSubjectIds.length,
          returnedSubjectIds: searchResultsSubjectIds,
        },
      },
    }
    await this.sendAuditEvent(auditEvent)
  }

  async logVaryApproverSearchEvent(
    requestId: string,
    searchTerm: string,
    searchResults: VaryApproverCaseloadSearchResponse,
    user: User,
  ): Promise<void> {
    const pduCaseIds = searchResults.pduCasesResponse.map(result => result.crnNumber)
    const regionCaseIds = searchResults.regionCasesResponse.map(result => result.crnNumber)
    // Convert to set to remove duplicates as the same case can be in both the PDU and region results
    const searchResultsSubjectIds = Array.from(new Set(pduCaseIds.concat(regionCaseIds)))

    const baseEventMessage = this.createAuditEvent(
      'VIEW_VARY_APPROVER_SEARCH_RESULTS_SUCCESS',
      undefined,
      requestId,
      user,
    )
    const auditEvent: AuditEvent = {
      ...baseEventMessage,
      subjectType: 'SEARCH_TERM',
      subjectId: searchTerm,
      details: {
        ...baseEventMessage.details,
        results: {
          resultCount: searchResultsSubjectIds.length,
          returnedSubjectIds: searchResultsSubjectIds,
        },
      },
    }
    await this.sendAuditEvent(auditEvent)
  }

  private async sendAuditEvent(auditEvent: AuditEvent): Promise<void> {
    if (config.sqs.audit.enabled) {
      logger.info(`sending audit event type: ${auditEvent.what}`)
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
