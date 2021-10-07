import moment from 'moment'
import CaseloadService from './caseloadService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import LicenceService from './licenceService'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'

jest.mock('./prisonerService')
jest.mock('./communityService')
jest.mock('./licenceService')

describe('Caseload Service', () => {
  const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
  const caseloadService = new CaseloadService(prisonerService, communityService, licenceService)

  beforeEach(() => {
    communityService.getStaffDetail.mockResolvedValue({ staffIdentifier: 2000 })
    communityService.getManagedOffenders.mockResolvedValue([])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([])
    licenceService.getLicencesByStaffIdAndStatus.mockResolvedValue([])
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
      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        { prisonerNumber: '1', status: 'ACTIVE' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')
      expect(caseload).toEqual([{ nomsNumber: '1', prisonerNumber: '1', currentOm: true, status: 'ACTIVE' }])
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
        { prisonerNumber: '1', status: 'ACTIVE', indeterminateSentence: true },
        { prisonerNumber: '2', status: 'ACTIVE', indeterminateSentence: false },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        { nomsNumber: '2', prisonerNumber: '2', currentOm: true, status: 'ACTIVE', indeterminateSentence: false },
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
        { prisonerNumber: '1', status: 'ACTIVE', indeterminateSentence: false, paroleEligibilityDate: '20/12/2022' },
        { prisonerNumber: '2', status: 'ACTIVE', indeterminateSentence: false },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        { nomsNumber: '2', prisonerNumber: '2', currentOm: true, status: 'ACTIVE', indeterminateSentence: false },
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
        { prisonerNumber: '1', indeterminateSentence: false, status: 'ACTIVE', legalStatus: 'DEAD' },
        { prisonerNumber: '2', indeterminateSentence: false, status: 'ACTIVE', legalStatus: 'REMAND' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
          legalStatus: 'REMAND',
        },
      ])
    })

    it('should filter out offenders who do not have a status in nomis', async () => {
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
        { prisonerNumber: '1', indeterminateSentence: false },
        { prisonerNumber: '2', indeterminateSentence: false, status: 'ACTIVE IN' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE IN',
          indeterminateSentence: false,
        },
      ])
    })

    it('should filter out offenders who have a non-active status in nomis', async () => {
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
        { prisonerNumber: '1', indeterminateSentence: false, status: 'INACTIVE OUT' },
        { prisonerNumber: '2', indeterminateSentence: false, status: 'ACTIVE IN' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE IN',
          indeterminateSentence: false,
        },
      ])
    })

    it('should filter out offenders who have a releaseDate in the past', async () => {
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
        {
          prisonerNumber: '1',
          indeterminateSentence: false,
          status: 'ACTIVE',
          releaseDate: moment().subtract(1, 'day').format('yyyy-MM-dd'),
        },
        { prisonerNumber: '2', indeterminateSentence: false, status: 'ACTIVE' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
        },
      ])
    })

    it('should not filter out offenders who have a releaseDate in the future', async () => {
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
        {
          prisonerNumber: '1',
          indeterminateSentence: false,
          status: 'ACTIVE',
          releaseDate: moment().add(1, 'day').format('yyyy-MM-DD'),
        },
        { prisonerNumber: '2', indeterminateSentence: false, status: 'ACTIVE' },
      ] as Prisoner[])

      const caseload = await caseloadService.getStaffCaseload('USER1')

      expect(caseload).toEqual([
        {
          currentOm: true,
          indeterminateSentence: false,
          nomsNumber: '1',
          prisonerNumber: '1',
          releaseDate: moment().add(1, 'day').format('yyyy-MM-DD'),
          status: 'ACTIVE',
        },
        {
          nomsNumber: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
        },
      ])
    })
  })

  it('should filter out offenders who have a home detention curfew end date', async () => {
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
      { prisonerNumber: '1', status: 'ACTIVE', indeterminateSentence: false, homeDetentionCurfewEndDate: '2021-10-07' },
      { prisonerNumber: '2', status: 'ACTIVE', indeterminateSentence: false },
    ] as Prisoner[])

    const caseload = await caseloadService.getStaffCaseload('USER1')

    expect(caseload).toEqual([
      { nomsNumber: '2', prisonerNumber: '2', currentOm: true, status: 'ACTIVE', indeterminateSentence: false },
    ])
  })

  it('should filter out offenders who have a licence already', async () => {
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
      { prisonerNumber: '1', status: 'ACTIVE', indeterminateSentence: false },
      { prisonerNumber: '2', status: 'ACTIVE', indeterminateSentence: false },
    ] as Prisoner[])
    licenceService.getLicencesByStaffIdAndStatus.mockResolvedValue([{ nomisId: '1' }] as LicenceSummary[])

    const caseload = await caseloadService.getStaffCaseload('USER1')

    expect(caseload).toEqual([
      { nomsNumber: '2', prisonerNumber: '2', currentOm: true, status: 'ACTIVE', indeterminateSentence: false },
    ])
    expect(licenceService.getLicencesByStaffIdAndStatus).toHaveBeenCalledWith(2000, 'USER1', [
      LicenceStatus.ACTIVE,
      LicenceStatus.INACTIVE,
      LicenceStatus.RECALLED,
    ])
  })
})
