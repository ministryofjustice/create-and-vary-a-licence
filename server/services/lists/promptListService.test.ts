import { add, endOfISOWeek, startOfISOWeek } from 'date-fns'
import PrisonerService from '../prisonerService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import PromptListService from './promptListService'
import LicenceStatus from '../../enumeration/licenceStatus'
import { CaseloadItem, LicenceSummary } from '../../@types/licenceApiClientTypes'
import { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import { CommunityApiStaffDetails } from '../../@types/communityClientTypes'

jest.mock('../prisonerService')
jest.mock('../communityService')

describe('PromptList Service', () => {
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new PromptListService(prisonerService, communityService, licenceService)

  beforeEach(() => {
    prisonerService.getHdcStatuses.mockResolvedValue([])
    licenceService.getLicencesByNomisIdsAndStatus = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByReleaseDate = jest.fn().mockResolvedValue([])

    licenceService.getLicencesForVariationApproval = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('finds prompt cases', async () => {
    const prisonerDetails = {
      prisoner: {
        prisonerNumber: 'G4169UO',
        firstName: 'EMAJINHANY',
        lastName: 'ELYSASHA',
        dateOfBirth: '1962-04-26',
        status: 'ACTIVE IN',
        prisonId: 'BAI',
        sentenceStartDate: '2017-03-01',
        releaseDate: '2024-07-19',
        confirmedReleaseDate: '2024-07-19',
        sentenceExpiryDate: '2028-08-31',
        licenceExpiryDate: '2028-08-31',
        conditionalReleaseDate: '2022-09-01',
      },
      cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null },
    } as CaseloadItem
    licenceService.searchPrisonersByReleaseDate.mockResolvedValue([prisonerDetails])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        firstName: 'Joe',
        surname: 'Bloggs',
        otherIds: {
          nomsNumber: 'G4169UO',
        },
        offenderManagers: [
          {
            active: true,
            staff: {
              code: 'X12345',
            },
            probationArea: {
              code: 'N01',
              description: 'Area N01',
            },
          },
        ],
      } as OffenderDetail,
    ])
    communityService.getStaffDetailByStaffCodeList.mockResolvedValue([
      {
        staffIdentifier: 2000,
        staffCode: 'X12345',
      },
    ] as CommunityApiStaffDetails[])

    await serviceUnderTest.getListForDates(startOfISOWeek(new Date()), endOfISOWeek(add(new Date(), { weeks: 3 })), [
      LicenceStatus.NOT_STARTED,
      LicenceStatus.IN_PROGRESS,
    ])
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(1)
    expect(prisonerService.getHdcStatuses).toHaveBeenCalledTimes(1)
  })

  describe('in the hard stop period', () => {
    it('Sets NOT_STARTED licences to TIMED_OUT when in the hard stop period', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          dateOfBirth: '1962-04-26',
          status: 'ACTIVE IN',
          prisonId: 'BAI',
          sentenceStartDate: '2017-03-01',
          releaseDate: '2024-07-19',
          confirmedReleaseDate: '2024-07-19',
          sentenceExpiryDate: '2028-08-31',
          licenceExpiryDate: '2028-08-31',
          conditionalReleaseDate: '2022-09-01',
        },
        cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null, isInHardStopPeriod: true },
      } as CaseloadItem

      communityService.getOffendersByNomsNumbers.mockResolvedValue([
        {
          firstName: 'Joe',
          surname: 'Bloggs',
          otherIds: {
            nomsNumber: 'G4169UO',
          },
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X12345',
              },
              probationArea: {
                code: 'N01',
                description: 'Area N01',
              },
            },
          ],
        } as OffenderDetail,
      ])

      communityService.getStaffDetailByStaffCodeList.mockResolvedValue([
        {
          staffIdentifier: 2000,
          staffCode: 'X12345',
        },
      ] as CommunityApiStaffDetails[])

      licenceService.searchPrisonersByReleaseDate.mockResolvedValue([prisonerDetails])
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])

      await serviceUnderTest.getListForDates(startOfISOWeek(new Date()), endOfISOWeek(add(new Date(), { weeks: 3 })), [
        LicenceStatus.NOT_STARTED,
        LicenceStatus.IN_PROGRESS,
      ])

      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(0)
      expect(prisonerService.getHdcStatuses).toHaveBeenCalledTimes(0)
    })

    it('gets prompt cases for in progress licences', async () => {
      const prisonerDetails = {
        prisoner: {
          prisonerNumber: 'G4169UO',
          firstName: 'EMAJINHANY',
          lastName: 'ELYSASHA',
          dateOfBirth: '1962-04-26',
          status: 'ACTIVE IN',
          prisonId: 'BAI',
          sentenceStartDate: '2017-03-01',
          releaseDate: '2024-07-19',
          confirmedReleaseDate: '2024-07-19',
          sentenceExpiryDate: '2028-08-31',
          licenceExpiryDate: '2028-08-31',
          conditionalReleaseDate: '2022-09-01',
        },
        cvl: { licenceType: 'AP', hardStopDate: null, hardStopWarningDate: null },
      } as CaseloadItem

      communityService.getOffendersByNomsNumbers.mockResolvedValue([
        {
          firstName: 'Joe',
          surname: 'Bloggs',
          otherIds: {
            nomsNumber: 'G4169UO',
            crn: 'A1234',
          },
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X12345',
                forenames: 'john',
                surname: 'smith',
              },
              fromDate: '2024-06-15',
              probationArea: {
                code: 'N01',
                description: 'Area N01',
              },
            },
          ],
        } as OffenderDetail,
      ])

      communityService.getStaffDetailByStaffCodeList.mockResolvedValue([
        {
          staffIdentifier: 2000,
          staffCode: 'X12345',
          email: 'someone@justice.gov.uk',
        },
      ] as CommunityApiStaffDetails[])

      licenceService.searchPrisonersByReleaseDate.mockResolvedValue([prisonerDetails])
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        { licenceId: 1, nomisId: 'G4169UO', isReviewNeeded: true } as LicenceSummary,
        {
          licenceId: 2,
          nomisId: 'G4169UO',
          licenceStatus: LicenceStatus.IN_PROGRESS,
        } as LicenceSummary,
      ])

      const result = await serviceUnderTest.getListForDates(
        startOfISOWeek(new Date()),
        endOfISOWeek(add(new Date(), { weeks: 3 })),
        [LicenceStatus.NOT_STARTED, LicenceStatus.IN_PROGRESS]
      )

      expect(result).toHaveLength(1)
      expect(result[0]).toEqual({
        comStaffCode: 'X12345',
        crn: 'A1234',
        comName: 'john smith',
        comEmail: 'someone@justice.gov.uk',
        comAllocationDate: '2024-06-15',
        comProbationAreaCode: 'N01',
        prisonerNumber: 'G4169UO',
        firstName: 'EMAJINHANY',
        lastName: 'ELYSASHA',
        releaseDate: '2024-07-19',
      })
      expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(1)
      expect(prisonerService.getHdcStatuses).toHaveBeenCalledTimes(1)
    })
  })
})
