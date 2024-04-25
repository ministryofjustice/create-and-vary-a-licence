import { format, add, startOfISOWeek, endOfISOWeek, subDays } from 'date-fns'

import LicenceStatus from '../server/enumeration/licenceStatus'
import CaseloadService from '../server/services/caseloadService'
import Container from '../server/services/container'
import PromptLicenceCreationService from './promptLicenceCreationService'
import LicenceType from '../server/enumeration/licenceType'
import type { ManagedCase } from '../server/@types/managedCase'
import type { CvlPrisoner } from '../server/@types/licenceApiClientTypes'
import LicenceService from '../server/services/licenceService'

jest.mock('../server/services/caseloadService')
jest.mock('../server/services/prisonerService')

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

const promptLicenceCreationService = new PromptLicenceCreationService(licenceService, caseloadService)

type OffenderManager = { active: boolean; fromDate: string }

describe('prompt licence creation service ', () => {
  beforeEach(() => {
    licenceService.searchPrisonersByReleaseDate = jest.fn()
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
      licenceService.searchPrisonersByReleaseDate.mockResolvedValue([])
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

function createManagedCase(offenderManagers: OffenderManager[], licenceStatus: LicenceStatus): ManagedCase {
  return {
    deliusRecord: { offenderId: 1, offenderManagers },
    cvlFields: {
      licenceType: 'AP',
      hardStopDate: '03/01/2023',
      hardStopWarningDate: '01/01/2023',
      isInHardStopPeriod: true,
      isDueForEarlyRelease: true,
      isDueToBeReleasedInTheNextTwoWorkingDays: true,
    },
    nomisRecord: {
      prisonId: 'someId',
      conditionalReleaseDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'someStatus',
    } as CvlPrisoner,
    licences: [{ status: licenceStatus, type: LicenceType.AP, isDueToBeReleasedInTheNextTwoWorkingDays: true }],
    probationPractitioner: { name: 'jim' },
  }
}
