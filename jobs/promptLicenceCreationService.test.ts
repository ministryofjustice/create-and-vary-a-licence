import { format, subDays } from 'date-fns'
import PromptLicenceCreationService from './promptLicenceCreationService'
import { LicenceApiClient } from '../server/data'
import PromptListService, { PromptCase } from '../server/services/lists/promptListService'
import { toIsoDate } from '../server/utils/utils'
import { EmailContact } from '../server/@types/licenceApiClientTypes'

jest.mock('../server/services/lists/promptListService')
jest.mock('../server/data')

const promptListService = new PromptListService(null, null, null) as jest.Mocked<PromptListService>
const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>

const promptLicenceCreationService = new PromptLicenceCreationService(promptListService, licenceApiClient)

const today = format(new Date(), 'yyyy-MM-dd')

describe('prompt licence creation service ', () => {
  beforeEach(() => {
    promptListService.getListForDates = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('create mail list', () => {
    it('build mail list for single urgent case', () => {
      const result = promptLicenceCreationService.buildEmailGroups([createPrompt({})], [])
      expect(result).toStrictEqual([
        {
          comName: 'A Staff',
          email: 'staff1@justice.gov.uk',
          initialPromptCases: [],
          urgentPromptCases: [{ crn: 'A1234', name: 'Alex Staffmember', releaseDate: today }],
        },
      ])
    })

    it('build mail list for single case for initial prompt', () => {
      const result = promptLicenceCreationService.buildEmailGroups([], [createPrompt({})])
      expect(result).toStrictEqual([
        {
          comName: 'A Staff',
          email: 'staff1@justice.gov.uk',
          initialPromptCases: [{ crn: 'A1234', name: 'Alex Staffmember', releaseDate: today }],
          urgentPromptCases: [],
        },
      ])
    })

    it('out of rollout areas are excluded', () => {
      const result = promptLicenceCreationService.buildEmailGroups(
        [],
        [createPrompt({ comProbationAreaCode: 'Some made up area' })]
      )
      expect(result).toStrictEqual([])
    })

    // grouping

    //     it('should only return cases with specific statuses', async () => {
    //       const managedCases = [createPrompt({ releaseDate: today })]

    //       licenceService.searchPrisonersByReleaseDate.mockResolvedValue([])
    //       promptLicenceCreationService.mapOffendersToLicences.mockResolvedValue(containerOfManagedCases)

    //       const earliestReleaseDate = startOfISOWeek(add(new Date(), { weeks: 12 }))
    //       const latestReleaseDate = endOfISOWeek(add(new Date(), { weeks: 12 }))

    //       const result = await promptLicenceCreationService.pollPrisonersDueForLicence(
    //         earliestReleaseDate,
    //         latestReleaseDate,
    //         [LicenceStatus.IN_PROGRESS, LicenceStatus.NOT_STARTED]
    //       )

    //       expect(result).toHaveLength(3)
    //     })
    //   })

    describe('excludeCasesNotAssignedToPpWithinPast7Days', () => {
      it('should exclude com allocations not made in past 7 days', async () => {
        promptListService.getListForDates.mockResolvedValueOnce([])

        const promptAllocatedWithinPast7Days = createPrompt({
          crn: 'Z5678',
          comAllocationDate: toIsoDate(subDays(new Date(), 3)),
        })
        const promptAllocatedNotWithinPast7Days = createPrompt({})

        promptListService.getListForDates.mockResolvedValueOnce([
          promptAllocatedWithinPast7Days,
          promptAllocatedNotWithinPast7Days,
        ])
        promptListService.getListForDates.mockResolvedValueOnce([])

        const result = await promptLicenceCreationService.gatherGroups()
        expect(result).toHaveLength(1)
        expect(result[0].urgentPromptCases).toHaveLength(0)
        expect(result[0].initialPromptCases).toHaveLength(1)
        expect(result[0].initialPromptCases[0].crn).toEqual('Z5678')
      })
    })

    describe('notifyComOfUpcomingReleases', () => {
      it('should not notify the responsible officer with a prompt to create a licence if no cases to prompt about', async () => {
        promptListService.getListForDates.mockResolvedValue([])
        await promptLicenceCreationService.run()
        expect(licenceApiClient.notifyComsToPromptEmailCreation).not.toHaveBeenCalled()
      })
    })

    it('should notify the responsible officer with a prompt to create a licence if initial prompts outstanding', async () => {
      const expectedRequest = [
        {
          initialPromptCases: [],
          urgentPromptCases: [
            {
              name: 'Alex Staffmember',
              crn: 'A1234',
              releaseDate: today,
            },
          ],
          email: 'staff1@justice.gov.uk',
          comName: 'A Staff',
        },
      ] as EmailContact[]
      promptListService.getListForDates.mockResolvedValue([])
      promptListService.getListForDates.mockResolvedValueOnce([createPrompt({})])

      await promptLicenceCreationService.run()

      expect(licenceApiClient.notifyComsToPromptEmailCreation).toHaveBeenCalledWith(expectedRequest)
    })

    //     it('should notify the responsible officer with a prompt to create a licence if urgent prompts outstanding', async () => {
    //       const expectedRequest = [
    //         {
    //           email: 'joe.bloggs@probation.gov.uk',
    //           comName: 'Joe Bloggs',
    //           initialPromptCases: [],
    //           urgentPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
    //         },
    //       ] as EmailContact[]
    //       await promptLicenceCreationService.notifyComOfUpcomingReleases(expectedRequest)
    //       expect(licenceApiClient.notifyComsToPromptEmailCreation).toHaveBeenCalledWith(expectedRequest)
    //     })

    //     it('should filter out email groups that have no cases', async () => {
    //       const cases = [
    //         {
    //           email: 'joe.bloggs@probation.gov.uk',
    //           comName: 'Joe Bloggs',
    //           initialPromptCases: [],
    //           urgentPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
    //         },
    //         {
    //           email: 'sid.bloggs@probation.gov.uk',
    //           comName: 'Sid Bloggs',
    //           initialPromptCases: [],
    //           urgentPromptCases: [],
    //         },
    //         {
    //           email: 'jim.bloggs@probation.gov.uk',
    //           comName: 'Jim Bloggs',
    //           initialPromptCases: [],
    //           urgentPromptCases: [{ crn: undefined, name: 'aaa', releaseDate: '2023-01-02' }],
    //         },
    //       ] as EmailContact[]
    //       await promptLicenceCreationService.notifyComOfUpcomingReleases(cases)
    //       const [a, , b] = cases
    //       expect(licenceApiClient.notifyComsToPromptEmailCreation).toHaveBeenCalledWith([a, b])
    //     })
    //   })
    // })

    // describe('buildEmailGroups', () => {
    //   it('should build email groups', async () => {
    //     communityService.getStaffDetailByStaffCodeList.mockResolvedValue([
    //       {
    //         staffCode: 'ABC',
    //         email: 'abc@justice.gov.uk',
    //         staff: { forenames: 'ABC', surname: 'STAFF' },
    //         probationArea: { code: 'N03', probationAreaId: 1 },
    //       },
    //       {
    //         staffCode: 'CDE',
    //         email: 'cde@justice.gov.uk',
    //         staff: { forenames: 'ABC', surname: 'STAFF' },
    //         probationArea: { code: 'N03', probationAreaId: 1 },
    //       },
    //       {
    //         staffCode: 'XYZ',
    //         email: 'xyz@justice.gov.uk',
    //         staff: { forenames: 'ABC', surname: 'STAFF' },
    //         probationArea: { code: 'N03', probationAreaId: 1 },
    //       },
    //     ])
    //     const result = await promptLicenceCreationService.buildEmailGroups(
    //       [
    //         createPrompt(
    //           [
    //             {
    //               active: true,
    //               fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    //               staff: { code: 'ABC' },
    //             } as OffenderManager,
    //             {
    //               active: false,
    //               fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    //               staff: { code: 'CDE' },
    //             } as OffenderManager,
    //           ],
    //           LicenceStatus.IN_PROGRESS,
    //           'A1234',
    //           { firstName: 'FAAA', lastName: 'LAAA', prisonerNumber: 'A1234AA' }
    //         ),
    //       ],
    //       [
    //         createPrompt(
    //           [
    //             {
    //               active: true,
    //               fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    //               staff: { code: 'XYZ' },
    //             } as OffenderManager,
    //           ],
    //           LicenceStatus.IN_PROGRESS,
    //           'B1234',
    //           { firstName: 'FBBB', lastName: 'LBBB', prisonerNumber: 'B1234BB' }
    //         ),
    //         createPrompt(
    //           [
    //             {
    //               active: true,
    //               fromDate: format(subDays(new Date(), 1), 'yyyy-MM-dd'),
    //               staff: { code: 'ABC' },
    //             } as OffenderManager,
    //           ],
    //           LicenceStatus.APPROVED,
    //           'C1234',
    //           { firstName: 'FCCC', lastName: 'LCCC', prisonerNumber: 'C1234CC' }
    //         ),
    //       ]
    //     )
    //     expect(result).toStrictEqual([
    //       {
    //         comName: 'ABC STAFF',
    //         email: 'abc@justice.gov.uk',
    //         initialPromptCases: [
    //           {
    //             crn: 'C1234',
    //             name: 'Fccc Lccc',
    //             releaseDate: today,
    //           },
    //         ],
    //         urgentPromptCases: [
    //           {
    //             crn: 'A1234',
    //             name: 'Faaa Laaa',
    //             releaseDate: today,
    //           },
    //         ],
    //       },
    //       {
    //         comName: 'ABC STAFF',
    //         email: 'xyz@justice.gov.uk',
    //         initialPromptCases: [
    //           {
    //             crn: 'B1234',
    //             name: 'Fbbb Lbbb',
    //             releaseDate: today,
    //           },
    //         ],
    //         urgentPromptCases: [],
    //       },
    //     ])
    //   })
  })

  function createPrompt({
    prisonerNumber = 'ZZZZZZZ',
    firstName = 'Alex',
    lastName = 'StaffMember',
    releaseDate = today,
    crn = 'A1234',
    comStaffCode = 'STAFF-1',
    comEmail = 'staff1@justice.gov.uk',
    comName = 'A Staff',
    comAllocationDate = '2024-01-01',
    comProbationAreaCode = 'N03',
  }: {
    prisonerNumber?: string
    firstName?: string
    lastName?: string
    releaseDate?: string
    crn?: string
    comStaffCode?: string
    comEmail?: string
    comName?: string
    comAllocationDate?: string
    comProbationAreaCode?: string
  }): PromptCase {
    return {
      prisonerNumber,
      firstName,
      lastName,
      releaseDate,
      crn,
      comStaffCode,
      comEmail,
      comName,
      comAllocationDate,
      comProbationAreaCode,
    }
  }
})
