import moment from 'moment'
import CaseloadService from './caseloadService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import { CommunityApiManagedOffender, CommunityApiTeamManagedCase } from '../@types/communityClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import LicenceService from './licenceService'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import HdcStatus from '../@types/HdcStatus'
import LicenceType from '../enumeration/licenceType'
import { User } from '../@types/CvlUserDetails'

jest.mock('./prisonerService')
jest.mock('./communityService')
jest.mock('./licenceService')

describe('Caseload Service', () => {
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
  const caseloadService = new CaseloadService(prisonerService, communityService, licenceService)
  const user = { deliusStaffIdentifier: 2000, probationTeams: ['teamA', 'teamB'] } as User

  beforeEach(() => {
    communityService.getManagedOffenders.mockResolvedValue([])
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue([])
    prisonerService.getHdcStatuses.mockResolvedValue([])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('getStaffCaseload', () => {
    it('should get managed offenders by the staffIdentifier for this user', async () => {
      await caseloadService.getStaffCaseload(user)
      expect(communityService.getManagedOffenders).toBeCalledTimes(1)
      expect(prisonerService.getHdcStatuses).toBeCalledTimes(1)
      expect(communityService.getManagedOffenders).toHaveBeenCalledWith(2000)
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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      const caseload = await caseloadService.getStaffCaseload(user)

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

      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { nomisId: '1', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.IN_PROGRESS },
        { nomisId: '2', licenceType: LicenceType.AP_PSS, licenceStatus: LicenceStatus.SUBMITTED },
        { nomisId: '3', licenceType: LicenceType.PSS, licenceStatus: LicenceStatus.APPROVED },
        { nomisId: '4', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.REJECTED },
        { nomisId: '6', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.INACTIVE },
      ] as LicenceSummary[])

      const caseload = await caseloadService.getStaffCaseload(user)

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
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
        ['1', '2', '3', '4', '5', '6'],
        [
          LicenceStatus.ACTIVE,
          LicenceStatus.RECALLED,
          LicenceStatus.IN_PROGRESS,
          LicenceStatus.SUBMITTED,
          LicenceStatus.APPROVED,
          LicenceStatus.REJECTED,
        ],
        user
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

      const caseload = await caseloadService.getStaffCaseload(user)

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

    it('should calculate licence types correctly', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        {
          nomsNumber: '1',
        },
        {
          nomsNumber: '2',
        },
        {
          nomsNumber: '3',
        },
        {
          nomsNumber: '4',
        },
        {
          nomsNumber: '5',
        },
      ] as CommunityApiManagedOffender[])

      prisonerService.searchPrisonersByNomisIds.mockResolvedValue([
        {
          prisonerNumber: '1',
          bookingId: '1',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2021-04-30',
        },
        {
          prisonerNumber: '2',
          bookingId: '2',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2022-04-30',
          topupSupervisionExpiryDate: '2024-04-30',
        },
        {
          prisonerNumber: '3',
          bookingId: '3',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-04-30',
          topupSupervisionExpiryDate: '2025-04-30',
          licenceExpiryDate: '2025-04-30',
        },
        {
          prisonerNumber: '4',
          bookingId: '4',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2024-04-30',
          topupSupervisionExpiryDate: '2026-04-30',
          sentenceExpiryDate: '2026-04-30',
        },
        {
          prisonerNumber: '5',
          bookingId: '5',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2025-04-30',
          topupSupervisionExpiryDate: '2027-04-30',
          sentenceExpiryDate: '2027-04-30',
          licenceExpiryDate: '2027-04-30',
        },
      ] as Prisoner[])

      prisonerService.getHdcStatuses.mockResolvedValue([
        new HdcStatus('1'),
        new HdcStatus('2'),
        new HdcStatus('3'),
        new HdcStatus('4'),
        new HdcStatus('5'),
      ])

      const caseload = await caseloadService.getStaffCaseload(user)

      expect(caseload).toStrictEqual([
        {
          nomsNumber: '1',
          bookingId: '1',
          prisonerNumber: '1',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2021-04-30',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP,
        },
        {
          nomsNumber: '2',
          bookingId: '2',
          prisonerNumber: '2',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2022-04-30',
          topupSupervisionExpiryDate: '2024-04-30',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.PSS,
        },
        {
          nomsNumber: '3',
          bookingId: '3',
          prisonerNumber: '3',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2023-04-30',
          licenceExpiryDate: '2025-04-30',
          topupSupervisionExpiryDate: '2025-04-30',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP_PSS,
        },
        {
          nomsNumber: '4',
          bookingId: '4',
          prisonerNumber: '4',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2024-04-30',
          sentenceExpiryDate: '2026-04-30',
          topupSupervisionExpiryDate: '2026-04-30',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP_PSS,
        },
        {
          nomsNumber: '5',
          bookingId: '5',
          prisonerNumber: '5',
          status: 'ACTIVE',
          indeterminateSentence: false,
          conditionalReleaseDate: '2025-04-30',
          licenceExpiryDate: '2027-04-30',
          sentenceExpiryDate: '2027-04-30',
          topupSupervisionExpiryDate: '2027-04-30',
          licenceStatus: LicenceStatus.NOT_STARTED,
          licenceType: LicenceType.AP_PSS,
        },
      ])
    })
  })

  describe('getVaryCaseload', () => {
    it('should get managed offenders by the staffIdentifier for this user', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        { nomsNumber: '1' },
        { nomsNumber: '2' },
      ] as CommunityApiManagedOffender[])

      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { nomisId: '1', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.IN_PROGRESS },
        { nomisId: '2', licenceType: LicenceType.AP_PSS, licenceStatus: LicenceStatus.SUBMITTED },
      ] as LicenceSummary[])

      const licences = await caseloadService.getVaryCaseload(user)

      expect(licences).toEqual(licences)
      expect(communityService.getManagedOffenders).toBeCalledTimes(1)
      expect(communityService.getManagedOffenders).toHaveBeenCalledWith(2000)
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
        ['1', '2'],
        [LicenceStatus.ACTIVE],
        user
      )
    })

    it('should filter managed offenders returned from community API without a nomis ID', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        { nomsNumber: '1' },
        { nomsNumber: null },
      ] as CommunityApiManagedOffender[])

      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { nomisId: '1', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.IN_PROGRESS },
      ] as LicenceSummary[])

      const licences = await caseloadService.getVaryCaseload(user)

      expect(licences).toEqual(licences)
      expect(communityService.getManagedOffenders).toBeCalledTimes(1)
      expect(communityService.getManagedOffenders).toHaveBeenCalledWith(2000)
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(['1'], [LicenceStatus.ACTIVE], user)
    })
  })

  describe('getTeamCaseload', () => {
    it('should get managed offenders by the staffIdentifier for this user', async () => {
      communityService.getManagedOffendersByTeam.mockResolvedValue([
        { nomsNumber: '1' },
        { nomsNumber: '2' },
      ] as CommunityApiTeamManagedCase[])

      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { nomisId: '1', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.IN_PROGRESS },
        { nomisId: '2', licenceType: LicenceType.AP_PSS, licenceStatus: LicenceStatus.SUBMITTED },
      ] as LicenceSummary[])

      const licences = await caseloadService.getTeamCaseload(user)

      expect(licences).toEqual(licences)
      expect(communityService.getManagedOffendersByTeam).toBeCalledTimes(1)
      expect(communityService.getManagedOffendersByTeam).toHaveBeenCalledWith(['teamA', 'teamB'])
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
        ['1', '2'],
        [
          LicenceStatus.ACTIVE,
          LicenceStatus.RECALLED,
          LicenceStatus.IN_PROGRESS,
          LicenceStatus.SUBMITTED,
          LicenceStatus.APPROVED,
          LicenceStatus.REJECTED,
        ],
        user
      )
    })

    it('should filter managed offenders returned from community API without a nomis ID', async () => {
      communityService.getManagedOffendersByTeam.mockResolvedValue([
        { nomsNumber: '1' },
        { nomsNumber: null },
      ] as CommunityApiTeamManagedCase[])

      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { nomisId: '1', licenceType: LicenceType.AP, licenceStatus: LicenceStatus.IN_PROGRESS },
      ] as LicenceSummary[])

      const licences = await caseloadService.getTeamCaseload(user)

      expect(licences).toEqual(licences)
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledWith(
        ['1'],
        [
          LicenceStatus.ACTIVE,
          LicenceStatus.RECALLED,
          LicenceStatus.IN_PROGRESS,
          LicenceStatus.SUBMITTED,
          LicenceStatus.APPROVED,
          LicenceStatus.REJECTED,
        ],
        user
      )
    })
  })
})
