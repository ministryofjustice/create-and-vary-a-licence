import moment from 'moment'
import CaseloadService from './caseloadService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import { CommunityApiManagedOffender } from '../@types/communityClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import LicenceService from './licenceService'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import HdcStatus from '../@types/HdcStatus'
import LicenceType from '../enumeration/licenceType'

jest.mock('./prisonerService')
jest.mock('./communityService')
jest.mock('./licenceService')

describe('Caseload Service', () => {
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
  const caseloadService = new CaseloadService(prisonerService, communityService, licenceService)
  const staffIdentifier = 2000

  beforeEach(() => {
    communityService.getManagedOffenders.mockResolvedValue([])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([])
    prisonerService.getHdcStatuses.mockResolvedValue([])
    licenceService.getLicencesByStaffIdAndStatus.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getStaffCaseload', () => {
    it('should get managed offenders by the staffIdentifier for this user', async () => {
      await caseloadService.getStaffCaseload('USER1', staffIdentifier)
      expect(communityService.getManagedOffenders).toBeCalledTimes(1)
      expect(prisonerService.getHdcStatuses).toBeCalledTimes(1)
      expect(communityService.getManagedOffenders).toHaveBeenCalledWith(staffIdentifier)
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

      await caseloadService.getStaffCaseload('USER1', staffIdentifier)
      expect(prisonerService.searchPrisonersByNomisIds).toHaveBeenCalledWith('USER1', ['2'])
    })

    it('should filter out offenders who are not found by nomisId in NOMIS', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        { nomsNumber: '1', currentOm: true },
        { nomsNumber: '2', currentOm: true },
      ] as CommunityApiManagedOffender[])

      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        {
          prisonerNumber: '1',
          bookingId: '1',
          status: 'ACTIVE',
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          bookingId: '1',
          nomsNumber: '1',
          prisonerNumber: '1',
          currentOm: true,
          status: 'ACTIVE',
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
        },
      ])
    })

    it('should filter out offenders who have an indeterminate sentence type or do not have a conditional release date', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
          currentOm: true,
        },
        {
          nomsNumber: '2',
          currentOm: true,
        },
        {
          nomsNumber: '3',
          currentOm: true,
        },
      ] as CommunityApiManagedOffender[])

      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        {
          prisonerNumber: '1',
          bookingId: '1',
          status: 'ACTIVE',
          indeterminateSentence: true,
          conditionalReleaseDate: '2023-05-12',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
        },
        { prisonerNumber: '3', bookingId: '3', status: 'ACTIVE', indeterminateSentence: false },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2'), new HdcStatus('3')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
        },
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
        {
          prisonerNumber: '1',
          bookingId: '1',
          status: 'ACTIVE',
          indeterminateSentence: false,
          paroleEligibilityDate: '20/12/2022',
          conditionalReleaseDate: '2023-05-12',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
        },
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
        {
          prisonerNumber: '1',
          bookingId: '1',
          indeterminateSentence: false,
          status: 'ACTIVE',
          legalStatus: 'DEAD',
          conditionalReleaseDate: '2023-05-12',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          indeterminateSentence: false,
          status: 'ACTIVE',
          legalStatus: 'REMAND',
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
          legalStatus: 'REMAND',
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
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
        { prisonerNumber: '1', bookingId: '1', indeterminateSentence: false, conditionalReleaseDate: '2023-05-12' },
        {
          prisonerNumber: '2',
          bookingId: '2',
          indeterminateSentence: false,
          status: 'ACTIVE IN',
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE IN',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
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
        {
          prisonerNumber: '1',
          bookingId: '1',
          indeterminateSentence: false,
          status: 'INACTIVE OUT',
          conditionalReleaseDate: '2023-05-12',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          indeterminateSentence: false,
          status: 'ACTIVE IN',
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE IN',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
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
          bookingId: '1',
          indeterminateSentence: false,
          status: 'ACTIVE',
          releaseDate: moment().subtract(1, 'day').format('yyyy-MM-dd'),
          conditionalReleaseDate: '2023-05-12',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          indeterminateSentence: false,
          status: 'ACTIVE',
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
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
          bookingId: '1',
          indeterminateSentence: false,
          status: 'ACTIVE',
          releaseDate: moment().add(1, 'day').format('yyyy-MM-DD'),
          conditionalReleaseDate: '2023-05-12',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          indeterminateSentence: false,
          status: 'ACTIVE',
          conditionalReleaseDate: '2023-05-12',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2')])

      const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

      expect(caseload).toEqual([
        {
          currentOm: true,
          indeterminateSentence: false,
          nomsNumber: '1',
          prisonerNumber: '1',
          bookingId: '1',
          releaseDate: moment().add(1, 'day').format('yyyy-MM-DD'),
          status: 'ACTIVE',
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
        },
        {
          nomsNumber: '2',
          prisonerNumber: '2',
          bookingId: '2',
          currentOm: true,
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-05-12',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
        },
      ])
    })
  })

  it('should filter out offenders who are eligible for HDC and checks have passed)', async () => {
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
        bookingId: '1',
        status: 'ACTIVE',
        indeterminateSentence: false,
        homeDetentionCurfewEndDate: '2021-10-07',
        conditionalReleaseDate: '2023-05-12',
      },
      {
        prisonerNumber: '2',
        bookingId: '2',
        status: 'ACTIVE',
        indeterminateSentence: false,
        homeDetentionCurfewEndDate: '2021-10-07',
        conditionalReleaseDate: '2023-05-12',
      },
    ] as Prisoner[])

    prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1', '2021-10-07', true), new HdcStatus('2')])

    const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

    expect(caseload).toEqual([
      {
        nomsNumber: '2',
        bookingId: '2',
        prisonerNumber: '2',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-12',
        homeDetentionCurfewEndDate: '2021-10-07',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
    ])
  })

  it('should NOT filter out offenders who are eligible for HDC but then REJECTED', async () => {
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
        bookingId: '1',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-04-12',
      },
      {
        prisonerNumber: '2',
        bookingId: '2',
        status: 'ACTIVE',
        indeterminateSentence: false,
        homeDetentionCurfewEndDate: '2021-10-07',
        conditionalReleaseDate: '2023-05-12',
      },
    ] as Prisoner[])

    prisonerService.getHdcStatuses.mockResolvedValue([
      new HdcStatus('1'),
      new HdcStatus('2', '2021-10-07', true, 'REJECTED'),
    ])

    const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

    expect(caseload).toEqual([
      {
        nomsNumber: '1',
        bookingId: '1',
        prisonerNumber: '1',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-04-12',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '2',
        bookingId: '2',
        prisonerNumber: '2',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-12',
        homeDetentionCurfewEndDate: '2021-10-07',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
    ])
  })

  it('should NOT filter out offenders who are eligible for HDC but failed checks', async () => {
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
        bookingId: '1',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-04-12',
      },
      {
        prisonerNumber: '2',
        bookingId: '2',
        status: 'ACTIVE',
        indeterminateSentence: false,
        homeDetentionCurfewEndDate: '2021-10-07',
        conditionalReleaseDate: '2023-05-12',
      },
    ] as Prisoner[])

    prisonerService.getHdcStatuses.mockResolvedValue([new HdcStatus('1'), new HdcStatus('2', '2021-10-07', false)])

    const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

    expect(caseload).toEqual([
      {
        nomsNumber: '1',
        bookingId: '1',
        prisonerNumber: '1',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-04-12',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '2',
        bookingId: '2',
        prisonerNumber: '2',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-12',
        homeDetentionCurfewEndDate: '2021-10-07',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
    ])
  })

  it('should filter existing ACTIVE and INACTIVE licences, but include other active statuses', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      {
        nomsNumber: '1',
        currentOm: true,
      },
      {
        nomsNumber: '2',
        currentOm: true,
      },
      {
        nomsNumber: '3',
        currentOm: true,
      },
      {
        nomsNumber: '4',
        currentOm: true,
      },
      {
        nomsNumber: '5',
        currentOm: true,
      },
      {
        nomsNumber: '6',
        currentOm: true,
      },
    ] as CommunityApiManagedOffender[])

    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      {
        prisonerNumber: '1',
        bookingId: '1',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-01',
      },
      {
        prisonerNumber: '2',
        bookingId: '2',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-02',
      },
      {
        prisonerNumber: '3',
        bookingId: '3',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-03',
      },
      {
        prisonerNumber: '4',
        bookingId: '4',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-04',
      },
      {
        prisonerNumber: '5',
        bookingId: '5',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-05',
      },
      {
        prisonerNumber: '6',
        bookingId: '6',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-06',
      },
    ] as Prisoner[])

    prisonerService.getHdcStatuses.mockResolvedValue([
      new HdcStatus('1'),
      new HdcStatus('2'),
      new HdcStatus('3'),
      new HdcStatus('4'),
      new HdcStatus('5'),
      new HdcStatus('6'),
    ])

    licenceService.getLicencesByStaffIdAndStatus.mockResolvedValue([
      { nomisId: '1', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.IN_PROGRESS },
      { nomisId: '2', licenceType: LicenceType.AP_PSS, licenceStatus: LicenceStatus.SUBMITTED },
      { nomisId: '3', licenceType: LicenceType.PSS, licenceStatus: LicenceStatus.APPROVED },
      { nomisId: '4', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.REJECTED },
      { nomisId: '6', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.INACTIVE },
    ] as LicenceSummary[])

    const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

    expect(caseload).toEqual([
      {
        nomsNumber: '1',
        bookingId: '1',
        prisonerNumber: '1',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-01',
        licenceStatus: LicenceStatus.IN_PROGRESS,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '2',
        bookingId: '2',
        prisonerNumber: '2',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-02',
        licenceStatus: LicenceStatus.SUBMITTED,
        licenceType: LicenceType.AP_PSS,
      },
      {
        nomsNumber: '3',
        bookingId: '3',
        prisonerNumber: '3',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-03',
        licenceStatus: LicenceStatus.APPROVED,
        licenceType: LicenceType.PSS,
      },
      {
        nomsNumber: '4',
        bookingId: '4',
        prisonerNumber: '4',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-04',
        licenceStatus: LicenceStatus.REJECTED,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '5',
        bookingId: '5',
        prisonerNumber: '5',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-05-05',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
    ])
    expect(licenceService.getLicencesByStaffIdAndStatus).toHaveBeenCalledWith(
      2000,
      [
        LicenceStatus.ACTIVE,
        LicenceStatus.RECALLED,
        LicenceStatus.IN_PROGRESS,
        LicenceStatus.SUBMITTED,
        LicenceStatus.APPROVED,
        LicenceStatus.REJECTED,
      ],
      'USER1'
    )
  })

  it('should sort offenders by conditional release date ascending', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      {
        nomsNumber: '1',
        currentOm: true,
      },
      {
        nomsNumber: '2',
        currentOm: true,
      },
      {
        nomsNumber: '3',
        currentOm: true,
      },
      {
        nomsNumber: '4',
        currentOm: true,
      },
    ] as CommunityApiManagedOffender[])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
      {
        prisonerNumber: '1',
        bookingId: '1',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2022-04-30',
      },
      {
        prisonerNumber: '2',
        bookingId: '2',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2024-04-30',
      },
      {
        prisonerNumber: '3',
        bookingId: '3',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2021-04-30',
      },
      {
        prisonerNumber: '4',
        bookingId: '4',
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-04-30',
      },
    ] as Prisoner[])

    prisonerService.getHdcStatuses.mockResolvedValue([
      new HdcStatus('1'),
      new HdcStatus('2'),
      new HdcStatus('3'),
      new HdcStatus('4'),
    ])

    const caseload = await caseloadService.getStaffCaseload('USER1', staffIdentifier)

    expect(caseload).toStrictEqual([
      {
        nomsNumber: '3',
        bookingId: '3',
        prisonerNumber: '3',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2021-04-30',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '1',
        bookingId: '1',
        prisonerNumber: '1',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2022-04-30',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '4',
        bookingId: '4',
        prisonerNumber: '4',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2023-04-30',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
      {
        nomsNumber: '2',
        bookingId: '2',
        prisonerNumber: '2',
        currentOm: true,
        status: 'ACTIVE',
        indeterminateSentence: false,
        conditionalReleaseDate: '2024-04-30',
        licenceStatus: LicenceStatus.NOT_STARTED,
        licenceType: LicenceType.AP,
      },
    ])
  })
})
