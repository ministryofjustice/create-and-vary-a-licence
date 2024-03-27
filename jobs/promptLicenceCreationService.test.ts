import { format, add, startOfISOWeek, endOfISOWeek, subDays } from 'date-fns'

import LicenceStatus from '../server/enumeration/licenceStatus'
import CaseloadService from '../server/services/caseloadService'
import Container from '../server/services/container'
import PrisonerService from '../server/services/prisonerService'
import PromptLicenceCreationService from './promptLicenceCreationService'
import LicenceType from '../server/enumeration/licenceType'

jest.mock('../server/services/caseloadService')
jest.mock('../server/services/prisonerService')

const caseloadService = new CaseloadService(null, null, null, null) as jest.Mocked<CaseloadService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

const promptLicenceCreationService = new PromptLicenceCreationService(prisonerService, caseloadService)

type OffenderManager = { active: boolean; fromDate: string }

describe('prompt licence creation service ', () => {
  beforeEach(() => {
    prisonerService.searchPrisonersByReleaseDate = jest.fn()
    caseloadService.pairNomisRecordsWithDelius = jest.fn()
    caseloadService.filterOffendersEligibleForLicence = jest.fn()
    caseloadService.mapOffendersToLicences = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const managedCases = [
    createManagedCase([{ active: true, fromDate: format(new Date(), 'yyyy-MM-dd') }], LicenceStatus.NOT_STARTED),

    createManagedCase(
      [
        { active: true, fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
        { active: false, fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd') },
      ],
      LicenceStatus.APPROVED
    ),

    createManagedCase(
      [
        { active: true, fromDate: format(subDays(new Date(), 7), 'yyyy-MM-dd') },
        { active: false, fromDate: format(subDays(new Date(), 7), 'yyyy-MM-dd') },
      ],
      LicenceStatus.IN_PROGRESS
    ),

    createManagedCase(
      [{ active: true, fromDate: format(subDays(new Date(), 8), 'yyyy-MM-dd') }],
      LicenceStatus.IN_PROGRESS
    ),
  ]

  const containerOfManagedCases = new Container(managedCases)

  describe('pollPrisonersDueForLicence', () => {
    it('should only return cases with specific statuses', async () => {
      prisonerService.searchPrisonersByReleaseDate.mockResolvedValue([])
      caseloadService.mapOffendersToLicences.mockResolvedValue(containerOfManagedCases)

      const earliestReleaseDate = startOfISOWeek(add(new Date(), { weeks: 12 }))
      const latestReleaseDate = endOfISOWeek(add(new Date(), { weeks: 12 }))

      const result = await promptLicenceCreationService.pollPrisonersDueForLicence(
        earliestReleaseDate,
        latestReleaseDate,
        [LicenceStatus.IN_PROGRESS, LicenceStatus.NOT_STARTED]
      )

      expect(result).toHaveLength(3)
    })
  })

  describe('excludeCasesNotAssignedToPpWithinPast7Days', () => {
    it('should exclude allocations not made in past 7 days', () => {
      const actualResult = promptLicenceCreationService.excludeCasesNotAssignedToPpWithinPast7Days(managedCases)
      expect(actualResult).toHaveLength(2)
    })
  })
})

function createManagedCase(offenderManagers: OffenderManager[], licenceStatus: LicenceStatus) {
  return {
    deliusRecord: { offenderId: 1, offenderManagers },
    nomisRecord: {
      restrictedPatient: false,
      prisonId: 'someId',
      conditionalReleaseDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'someStatus',
    },
    licences: [{ status: licenceStatus, type: LicenceType.AP }],
    probationPractitioner: { name: 'jim' },
  }
}
