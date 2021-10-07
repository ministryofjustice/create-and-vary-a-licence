import CaseloadService from './caseloadService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'

jest.mock('./prisonerService')
jest.mock('./communityService')

describe('Caseload Service', () => {
  const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null) as jest.Mocked<CommunityService>
  const caseloadService = new CaseloadService(prisonerService, communityService, null)

  beforeEach(() => {
    communityService.getStaffDetail.mockResolvedValue({})
    communityService.getManagedOffenders.mockResolvedValue([])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getStaffCaseload', () => {
    it('should get managed offenders by the the users staffIdentifier', async () => {
      communityService.getStaffDetail.mockResolvedValue({ staffIdentifier: 2000 })
      await caseloadService.getStaffCaseload('USER1')
      expect(communityService.getStaffDetail).toBeCalledTimes(1)
      expect(communityService.getStaffDetail).toHaveBeenCalledWith('USER1')
      expect(communityService.getManagedOffenders).toBeCalledTimes(1)
      expect(communityService.getManagedOffenders).toHaveBeenCalledWith(2000)
    })

    it('should filter out offenders who are not managed by the current user', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
          currentOm: false,
        },
        {
          nomsNumber: '2',
          currentOm: true,
        },
      ] as CommunityApiManagedOffender[])

      await caseloadService.getStaffCaseload('USER1')

      expect(prisonerService.searchPrisonersByNomisIds).toHaveBeenCalledWith('USER1', ['2'])
    })

    it('should filter out offenders who are not found by nomisId in NOMIS', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
          currentOm: true,
        },
        {
          nomsNumber: '2',
          currentOm: true,
        },
      ] as CommunityApiManagedOffender[])
      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([{ prisonerNumber: '1' }] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([{ nomsNumber: '1', prisonerNumber: '1', currentOm: true }])
    })

    it('should filter out offenders who have an indeterminate sentence type', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
          currentOm: true,
        },
        {
          nomsNumber: '2',
          currentOm: true,
        },
      ] as CommunityApiManagedOffender[])
      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        { prisonerNumber: '1', indeterminateSentence: true },
        { prisonerNumber: '2', indeterminateSentence: false },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        { nomsNumber: '2', prisonerNumber: '2', currentOm: true, indeterminateSentence: false },
      ])
    })

    it('should filter out offenders who are eligible for parole', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
          currentOm: true,
        },
        {
          nomsNumber: '2',
          currentOm: true,
        },
      ] as CommunityApiManagedOffender[])
      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        { prisonerNumber: '1', indeterminateSentence: false, paroleEligibilityDate: '20/12/2022' },
        { prisonerNumber: '2', indeterminateSentence: false },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        { nomsNumber: '2', prisonerNumber: '2', currentOm: true, indeterminateSentence: false },
      ])
    })

    it('should filter out offenders who are dead', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
          currentOm: true,
        },
        {
          nomsNumber: '2',
          currentOm: true,
        },
      ] as CommunityApiManagedOffender[])
      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        { prisonerNumber: '1', indeterminateSentence: false, legalStatus: 'DEAD' },
        { prisonerNumber: '2', indeterminateSentence: false, legalStatus: 'REMAND' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        { nomsNumber: '2', prisonerNumber: '2', currentOm: true, indeterminateSentence: false, legalStatus: 'REMAND' },
      ])
    })
  })
})
