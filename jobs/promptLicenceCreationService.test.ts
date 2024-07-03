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

    it('should group prompt cases by email', () => {
      const urgentEmail1 = createPrompt({
        comName: 'com 1',
        prisonerNumber: 'G4169UO',
        comEmail: 'email1@justice.gov.uk',
      })
      const nonUrgetEmail1 = createPrompt({
        comName: 'com 1',
        prisonerNumber: 'G7436KC',
        comEmail: 'email1@justice.gov.uk',
      })
      const urgentEmail2 = createPrompt({
        comName: 'com 2',
        prisonerNumber: 'G1945CG',
        comEmail: 'email2@justice.gov.uk',
      })

      const result = promptLicenceCreationService.buildEmailGroups([urgentEmail1, urgentEmail2], [nonUrgetEmail1])
      expect(result).toHaveLength(2)
      expect(result).toStrictEqual([
        {
          comName: 'com 1',
          email: 'email1@justice.gov.uk',
          initialPromptCases: [{ crn: 'A1234', name: 'Alex Staffmember', releaseDate: today }],
          urgentPromptCases: [
            {
              crn: 'A1234',
              name: 'Alex Staffmember',
              releaseDate: today,
            },
          ],
        },
        {
          comName: 'com 2',
          email: 'email2@justice.gov.uk',
          initialPromptCases: [],
          urgentPromptCases: [
            {
              crn: 'A1234',
              name: 'Alex Staffmember',
              releaseDate: today,
            },
          ],
        },
      ])
    })

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
