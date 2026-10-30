import { AuditService as HmppsAuditService } from '@ministryofjustice/hmpps-audit-client'
import { User } from '../../@types/CvlUserDetails'
import AuditService from './auditService'
import { CaCase, FoundComCase, Licence, PrisonCaseAdminSearchResult } from '../../@types/licenceApiClientTypes'
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
  })

  describe('custom handlers', () => {
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
  })
})
