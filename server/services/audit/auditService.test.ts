import { AuditService as HmppsAuditService } from '@ministryofjustice/hmpps-audit-client'
import { Request } from 'express'
import { User } from '../../@types/CvlUserDetails'
import AuditService from './auditService'
import {
  ApprovalCase,
  ApproverSearchResponse,
  CaCase,
  FoundComCase,
  Licence,
  PrisonCaseAdminSearchResult,
  VaryApproverCase,
  VaryApproverCaseloadSearchResponse,
} from '../../@types/licenceApiClientTypes'
import config from '../../config'

jest.mock('../../data/licenceApiClient')
jest.mock('@ministryofjustice/hmpps-audit-client')

describe('AuditService', () => {
  const hmppsAuditService = new HmppsAuditService(null) as jest.Mocked<HmppsAuditService>
  const auditService = new AuditService(hmppsAuditService) as jest.Mocked<AuditService>

  const user = {
    username: 'joebloggs',
    displayName: 'Joe Bloggs',
    deliusStaffIdentifier: 2000,
    firstName: 'Joe',
    lastName: 'Bloggs',
    emailAddress: 'jbloggs@probation.gov.uk',
    userRoles: ['ROLE_PROBATION'],
    authSource: 'delius',
  } as User

  const licence = {
    nomsId: 'A1234BC',
    probationTeamCode: 'ABC123',
    kind: 'CRD',
    id: 1,
    statusCode: 'IN_PROGRESS',
    version: '3.0',
  } as Licence

  const requestId = 'request-id'

  beforeEach(() => {
    config.sqs.audit.enabled = true
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('logPageViewAttempt', () => {
    it('should not send an event if audit is disabled', async () => {
      config.sqs.audit.enabled = false
      const eventType = 'VIEWED_SOMETHING'

      await auditService.logPageViewAttempt(requestId, { eventType, audit: true }, licence, user)

      expect(hmppsAuditService.logAuditEvent).not.toHaveBeenCalled()
    })

    it('should log an event for a page view attempt by a probation user', async () => {
      const eventType = 'VIEWED_SOMETHING'
      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logPageViewAttempt(requestId, { eventType, audit: true }, licence, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `${eventType}_ATTEMPT`,
        subjectType: 'CRN',
        subjectId: licence.crn,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
        },
      })
    })

    it('should log an event for a page view attempt by a prison user', async () => {
      const eventType = 'VIEWED_SOMETHING'
      const prisonUser = {
        ...user,
        nomisStaffId: 1000,
        userRoles: ['ROLE_PRISON'],
        authSource: 'nomis',
      }
      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logPageViewAttempt(requestId, { eventType, audit: true }, licence, prisonUser)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `${eventType}_ATTEMPT`,
        subjectType: 'PRISONER_ID',
        subjectId: licence.nomsId,
        correlationId: requestId,
        who: prisonUser.username,
        details: {
          build: config.gitRef,
          userRoles: prisonUser.userRoles,
        },
      })
    })

    it('should use a subject type of NOT_APPLICABLE when licence is not available', async () => {
      const eventType = 'VIEWED_SOMETHING'
      const prisonUser = {
        ...user,
        nomisStaffId: 1000,
        userRoles: ['ROLE_PRISON'],
      }
      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logPageViewAttempt(requestId, { eventType, audit: true }, undefined, prisonUser)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `${eventType}_ATTEMPT`,
        subjectType: 'NOT_APPLICABLE',
        subjectId: '',
        correlationId: requestId,
        who: prisonUser.username,
        details: {
          build: config.gitRef,
          userRoles: prisonUser.userRoles,
        },
      })
    })
  })

  describe('logPageViewSuccess', () => {
    it('should log an event for a successful page view', async () => {
      const eventType = 'VIEWED_SOMETHING'
      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logPageViewSuccess(requestId, { eventType, audit: true }, licence, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `${eventType}_SUCCESS`,
        subjectType: 'CRN',
        subjectId: licence.crn,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
        },
      })
    })

    it('should log an event for a report view', async () => {
      const eventType = 'VIEWED_A_REPORT'
      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logReportView(requestId, eventType, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'NOT_APPLICABLE',
        subjectId: '',
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
        },
      })
    })
  })

  describe('custom handlers', () => {
    it('should log viewing the COM caseload', async () => {
      const eventType = 'VIEW_CREATE_CASELOAD'
      const team = 'team1'
      const caseload = [
        {
          crnNumber: 'CRN123',
        },
        {
          crnNumber: 'CRN456',
        },
      ]

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logComCaseloadEvent(requestId, team, caseload, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'NOT_APPLICABLE',
        subjectId: '',
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          queryParams: {
            team,
          },
          results: {
            resultCount: caseload.length,
            returnedSubjectIds: caseload.map(result => result.crnNumber),
          },
        },
      })
    })

    it('should log viewing the approver caseload', async () => {
      const eventType = 'VIEW_LICENCE_APPROVE_CASES'
      const prisons = ['prisonA']
      const caseload = [
        {
          prisonerNumber: 'A1234BC',
        },
        {
          prisonerNumber: 'B1234BC',
        },
      ]

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logApproverCaseloadEvent(requestId, prisons, caseload, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'NOT_APPLICABLE',
        subjectId: '',
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          queryParams: {
            prisons: prisons.join() || '',
          },
          results: {
            resultCount: caseload.length,
            returnedSubjectIds: caseload.map(result => result.prisonerNumber),
          },
        },
      })
    })

    it('should log viewing the vary approver caseload', async () => {
      const eventType = 'VIEW_LICENCE_VARY_APPROVE_CASES'
      const regions = 'region1'
      const caseload = [
        {
          crnNumber: 'CRN123',
        },
        {
          crnNumber: 'CRN456',
        },
      ]

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logVaryApproverCaseloadEvent(requestId, regions, caseload, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'NOT_APPLICABLE',
        subjectId: '',
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          queryParams: {
            regions,
          },
          results: {
            resultCount: caseload.length,
            returnedSubjectIds: caseload.map(result => result.crnNumber),
          },
        },
      })
    })

    it('should log viewing the OMU caseload', async () => {
      const eventType = 'VIEW_LICENCE_VIEW_CASES'
      const prisons = ['prisonA']
      const caseload = [
        {
          prisonerNumber: 'A1234BC',
        },
        {
          prisonerNumber: 'B1234BC',
        },
      ]

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logOmuCaseloadEvent(requestId, prisons, caseload, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'NOT_APPLICABLE',
        subjectId: '',
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          queryParams: {
            prisons: prisons.join() || '',
          },
          results: {
            resultCount: caseload.length,
            returnedSubjectIds: caseload.map(result => result.prisonerNumber),
          },
        },
      })
    })

    it('should log a probation search event', async () => {
      const eventType = 'VIEW_PROBATION_SEARCH_RESULTS_SUCCESS'
      const searchTerm = 'CRN123'
      const searchResults = [
        {
          crn: 'CRN123',
          kind: 'CRD',
        } as FoundComCase,
        {
          crn: 'CRN456',
          kind: 'PRRD',
        } as FoundComCase,
      ]

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logProbationSearchEvent(requestId, searchTerm, searchResults, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'SEARCH_TERM',
        subjectId: searchTerm,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          results: {
            resultCount: searchResults.length,
            returnedSubjectIds: searchResults.map(result => result.crn),
          },
        },
      })
    })

    it('should log a CA search event', async () => {
      const eventType = 'VIEW_CA_SEARCH_RESULTS_SUCCESS'
      const searchTerm = 'A1234BC'
      const searchResults: PrisonCaseAdminSearchResult = {
        inPrisonResults: [
          {
            prisonerNumber: 'A1234BC',
            name: 'prisoner one',
          } as CaCase,
        ],
        onProbationResults: [
          {
            prisonerNumber: 'B1234BC',
            name: 'probation one',
          } as CaCase,
        ],
        attentionNeededResults: [
          {
            prisonerNumber: 'C1234BC',
            name: 'attention one',
          } as CaCase,
        ],
      }
      const expectedResultCount =
        searchResults.inPrisonResults.length +
        searchResults.onProbationResults.length +
        searchResults.attentionNeededResults.length
      const expectedSubjectIds = searchResults.inPrisonResults
        .map(result => result.prisonerNumber)
        .concat(searchResults.onProbationResults.map(result => result.prisonerNumber))
        .concat(searchResults.attentionNeededResults.map(result => result.prisonerNumber))

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logCaSearchEvent(requestId, searchTerm, searchResults, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'SEARCH_TERM',
        subjectId: searchTerm,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          results: {
            resultCount: expectedResultCount,
            returnedSubjectIds: expectedSubjectIds,
          },
        },
      })
    })

    it('should log an approver search event', async () => {
      const eventType = 'VIEW_APPROVER_SEARCH_RESULTS_SUCCESS'
      const searchTerm = 'name'
      const searchResults: ApproverSearchResponse = {
        approvalNeededResponse: [
          {
            prisonerNumber: 'A1234BC',
          } as ApprovalCase,
        ],
        recentlyApprovedResponse: [
          {
            prisonerNumber: 'A9823BD',
          } as ApprovalCase,
        ],
      }

      const expectedSubjectIds = searchResults.approvalNeededResponse
        .map(result => result.prisonerNumber)
        .concat(searchResults.recentlyApprovedResponse.map(result => result.prisonerNumber))
      const expectedResultCount = expectedSubjectIds.length

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logApproverSearchEvent(requestId, searchTerm, searchResults, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'SEARCH_TERM',
        subjectId: searchTerm,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          results: {
            resultCount: expectedResultCount,
            returnedSubjectIds: expectedSubjectIds,
          },
        },
      })
    })

    it('should log a vary approver search event', async () => {
      const eventType = 'VIEW_VARY_APPROVER_SEARCH_RESULTS_SUCCESS'
      const searchTerm = 'a name'
      const searchResults: VaryApproverCaseloadSearchResponse = {
        pduCasesResponse: [
          {
            crnNumber: 'CRN123',
          } as VaryApproverCase,
        ],
        regionCasesResponse: [
          {
            crnNumber: 'CRN456',
          } as VaryApproverCase,
        ],
      }

      const expectedSubjectIds = searchResults.pduCasesResponse
        .map(result => result.crnNumber)
        .concat(searchResults.regionCasesResponse.map(result => result.crnNumber))
      const expectedResultCount = expectedSubjectIds.length

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logVaryApproverSearchEvent(requestId, searchTerm, searchResults, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: eventType,
        subjectType: 'SEARCH_TERM',
        subjectId: searchTerm,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
          results: {
            resultCount: expectedResultCount,
            returnedSubjectIds: expectedSubjectIds,
          },
        },
      })
    })

    it('should log a view licence confirm create failure event', async () => {
      const eventType = 'LICENCE_CREATION_CONFIRMATION_FAILURE'
      const nomisId = 'A1234BC'

      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logLicenceConfirmCreateFailure(requestId, 'GET', nomisId, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `VIEW_${eventType}`,
        subjectType: 'PRISONER_ID',
        subjectId: nomisId,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
        },
      })

      await auditService.logLicenceConfirmCreateFailure(requestId, 'POST', nomisId, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `CREATE_${eventType}`,
        subjectType: 'PRISONER_ID',
        subjectId: nomisId,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
        },
      })
    })

    it('should log a page access failure event', async () => {
      const req = {
        id: 'request-id',
        baseUrl: '',
        method: 'GET',
        path: '/licence/create/id/37/bespoke-conditions',
      } as Request

      const eventType = 'VIEW_BESPOKE_CONDITIONS'
      hmppsAuditService.logAuditEvent.mockResolvedValue(undefined)

      await auditService.logPageAccessFailure(req, licence, user)

      expect(hmppsAuditService.logAuditEvent).toHaveBeenCalledWith({
        what: `${eventType}_FAILURE`,
        subjectType: 'CRN',
        subjectId: licence.crn,
        correlationId: requestId,
        who: user.username,
        details: {
          build: config.gitRef,
          userRoles: user.userRoles,
        },
      })
    })
  })
})
