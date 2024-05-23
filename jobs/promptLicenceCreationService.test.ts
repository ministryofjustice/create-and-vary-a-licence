import { format, add, startOfISOWeek, endOfISOWeek, subDays } from 'date-fns'

import LicenceStatus from '../server/enumeration/licenceStatus'
import CaseloadService from '../server/services/caseloadService'
import Container from '../server/services/container'
import PromptLicenceCreationService from './promptLicenceCreationService'
import LicenceType from '../server/enumeration/licenceType'
import type { ManagedCase } from '../server/@types/managedCase'
import type { CvlPrisoner, EmailContact } from '../server/@types/licenceApiClientTypes'
import LicenceService from '../server/services/licenceService'
import CommunityService from '../server/services/communityService'
import { LicenceApiClient } from '../server/data'

jest.mock('../server/services/caseloadService')
jest.mock('../server/services/prisonerService')
jest.mock('../server/services/communityService')
jest.mock('../server/data')

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>

const promptLicenceCreationService = new PromptLicenceCreationService(
  licenceService,
  caseloadService,
  communityService,
  licenceApiClient
)

const today = format(new Date(), 'yyyy-MM-dd')
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
    createManagedCase([{ active: true, fromDate: today }], LicenceStatus.NOT_STARTED),

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

  describe('notifyComOfUpcomingReleases', () => {
    it('should not notify the responsible officer with a prompt to create a licence if no cases to prompt about', async () => {
      const expectedRequest = [
        { email: 'joe.bloggs@probation.gov.uk', comName: 'Joe Bloggs', initialPromptCases: [], urgentPromptCases: [] },
      ] as EmailContact[]
      await promptLicenceCreationService.notifyComOfUpcomingReleases(expectedRequest)
      expect(licenceApiClient.notifyComsToPromptEmailCreation).not.toHaveBeenCalled()
    })

    it('should notify the responsible officer with a prompt to create a licence if initial prompts outstanding', async () => {
      const expectedRequest = [
        {
          email: 'joe.bloggs@probation.gov.uk',
          comName: 'Joe Bloggs',
          initialPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
          urgentPromptCases: [],
        },
      ] as EmailContact[]
      await promptLicenceCreationService.notifyComOfUpcomingReleases(expectedRequest)
      expect(licenceApiClient.notifyComsToPromptEmailCreation).toHaveBeenCalledWith(expectedRequest)
    })

    it('should notify the responsible officer with a prompt to create a licence if urgent prompts outstanding', async () => {
      const expectedRequest = [
        {
          email: 'joe.bloggs@probation.gov.uk',
          comName: 'Joe Bloggs',
          initialPromptCases: [],
          urgentPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
        },
      ] as EmailContact[]
      await promptLicenceCreationService.notifyComOfUpcomingReleases(expectedRequest)
      expect(licenceApiClient.notifyComsToPromptEmailCreation).toHaveBeenCalledWith(expectedRequest)
    })

    it('should filter out email groups that have no cases', async () => {
      const cases = [
        {
          email: 'joe.bloggs@probation.gov.uk',
          comName: 'Joe Bloggs',
          initialPromptCases: [],
          urgentPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
        },
        {
          email: 'sid.bloggs@probation.gov.uk',
          comName: 'Sid Bloggs',
          initialPromptCases: [],
          urgentPromptCases: [],
        },
        {
          email: 'jim.bloggs@probation.gov.uk',
          comName: 'Jim Bloggs',
          initialPromptCases: [],
          urgentPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
        },
      ] as EmailContact[]
      await promptLicenceCreationService.notifyComOfUpcomingReleases(cases)
      const [a, , b] = cases
      expect(licenceApiClient.notifyComsToPromptEmailCreation).toHaveBeenCalledWith([a, b])
    })
  })
})

describe('buildEmailGroups', () => {
  it('should build email groups', async () => {
    communityService.getStaffDetailByStaffCodeList.mockResolvedValue([
      {
        staffCode: 'ABC',
        email: 'abc@justice.gov.uk',
        staff: { forenames: 'ABC', surname: 'STAFF' },
        probationArea: { code: 'N03', probationAreaId: 1 },
      },
      {
        staffCode: 'CDE',
        email: 'cde@justice.gov.uk',
        staff: { forenames: 'ABC', surname: 'STAFF' },
        probationArea: { code: 'N03', probationAreaId: 1 },
      },
      {
        staffCode: 'XYZ',
        email: 'xyz@justice.gov.uk',
        staff: { forenames: 'ABC', surname: 'STAFF' },
        probationArea: { code: 'N03', probationAreaId: 1 },
      },
    ])
    const result = await promptLicenceCreationService.buildEmailGroups(
      [
        createManagedCase(
          [
            {
              active: true,
              fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              staff: { code: 'ABC' },
            } as OffenderManager,
            {
              active: false,
              fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              staff: { code: 'CDE' },
            } as OffenderManager,
          ],
          LicenceStatus.IN_PROGRESS,
          'A1234',
          { firstName: 'FAAA', lastName: 'LAAA', prisonerNumber: 'A1234AA' }
        ),
      ],
      [
        createManagedCase(
          [
            {
              active: true,
              fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              staff: { code: 'XYZ' },
            } as OffenderManager,
          ],
          LicenceStatus.IN_PROGRESS,
          'B1234',
          { firstName: 'FBBB', lastName: 'LBBB', prisonerNumber: 'B1234BB' }
        ),
        createManagedCase(
          [
            {
              active: true,
              fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
              staff: { code: 'ABC' },
            } as OffenderManager,
          ],
          LicenceStatus.APPROVED,
          'C1234',
          { firstName: 'FCCC', lastName: 'LCCC', prisonerNumber: 'C1234CC' }
        ),
      ]
    )
    expect(result).toStrictEqual([
      {
        comName: 'ABC STAFF',
        email: 'abc@justice.gov.uk',
        initialPromptCases: [
          {
            crn: 'C1234',
            name: 'Fccc Lccc',
            releaseDate: today,
          },
        ],
        urgentPromptCases: [
          {
            crn: 'A1234',
            name: 'Faaa Laaa',
            releaseDate: today,
          },
        ],
      },
      {
        comName: 'ABC STAFF',
        email: 'xyz@justice.gov.uk',
        initialPromptCases: [
          {
            crn: 'B1234',
            name: 'Fbbb Lbbb',
            releaseDate: today,
          },
        ],
        urgentPromptCases: [],
      },
    ])
  })
})

function createManagedCase(
  offenderManagers: OffenderManager[],
  licenceStatus: LicenceStatus,
  crn: string = 'A1234',
  prisoner: { firstName: string; lastName: string; prisonerNumber: string } = {
    firstName: 'firstName',
    lastName: 'lastName',
    prisonerNumber: 'ZZZZZZZ',
  }
): ManagedCase {
  return {
    deliusRecord: { offenderId: 1, offenderManagers, offenderCrn: crn },
    cvlFields: {
      licenceType: 'AP',
      hardStopDate: '03/01/2023',
      hardStopWarningDate: '01/01/2023',
      isInHardStopPeriod: true,
      isDueForEarlyRelease: true,
      isDueToBeReleasedInTheNextTwoWorkingDays: true,
      isEligibleForEarlyRelease: false,
    },
    nomisRecord: {
      prisonId: 'someId',
      firstName: prisoner.firstName,
      lastName: prisoner.lastName,
      conditionalReleaseDate: today,
      status: 'someStatus',
      prisonerNumber: prisoner.prisonerNumber,
    } as CvlPrisoner,
    licences: [
      {
        status: licenceStatus,
        type: LicenceType.AP,
        isDueToBeReleasedInTheNextTwoWorkingDays: true,
        releaseDate: null,
      },
    ],
    probationPractitioner: { name: 'jim' },
  }
}
