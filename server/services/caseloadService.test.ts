import { addDays, add, format, startOfDay, endOfDay } from 'date-fns'
import CaseloadService from './caseloadService'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import LicenceService from './licenceService'
import { User } from '../@types/CvlUserDetails'
import { OffenderDetail } from '../@types/probationSearchApiClientTypes'
import HdcStatus from '../@types/HdcStatus'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { ManagedCase } from '../@types/managedCase'
import Container from './container'
import { CaseloadItem } from '../@types/licenceApiClientTypes'

jest.mock('./prisonerService')
jest.mock('./communityService')
// jest.mock('./licenceService')

describe('Caseload Service', () => {
  const elevenDaysFromNow = format(addDays(new Date(), 11), 'yyyy-MM-dd')
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const nineDaysFromNow = format(addDays(new Date(), 9), 'yyyy-MM-dd')
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new CaseloadService(prisonerService, communityService, licenceService)
  const user = {
    deliusStaffIdentifier: 2000,
    probationTeamCodes: ['teamA', 'teamB'],
    prisonCaseload: ['p1', 'p2'],
  } as User

  beforeEach(() => {
    communityService.getManagedOffenders.mockResolvedValue([])
    communityService.getManagedOffendersByTeam.mockResolvedValue([])
    communityService.getOffendersByCrn.mockResolvedValue([])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([])
    prisonerService.getHdcStatuses.mockResolvedValue([])
    licenceService.getLicencesByNomisIdsAndStatus = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByReleaseDate = jest.fn().mockResolvedValue([])
    licenceService.searchPrisonersByNomsIds = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForVariationApproval = jest.fn().mockResolvedValue([])
    licenceService.getLicencesForOmu = jest.fn().mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Does not call Licence API when no Nomis records are found', async () => {
    const offenders = new Container([
      {
        nomisRecord: { prisonerNumber: null },
      } as ManagedCase,
    ])
    await serviceUnderTest.mapOffendersToLicences(offenders)
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(0)
  })

  it('Calls Licence API when Nomis records are found', async () => {
    const offenders = new Container([
      {
        nomisRecord: { prisonerNumber: 'ABC123', conditionalReleaseDate: tenDaysFromNow },
        cvlFields: { hardStopDate: '03/02/2023', hardStopWarningDate: '01/02/2023' },
      } as ManagedCase,
    ])
    await serviceUnderTest.mapOffendersToLicences(offenders)
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(1)
  })

  it('filters invalid data due to mismatch between delius and nomis', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12346' },
      { offenderCrn: 'X12347' },
      { offenderCrn: 'X12348' },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234D', crn: 'X12346' } } as OffenderDetail,
      { otherIds: { crn: 'X12347' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: { prisonerNumber: 'AB1234E', conditionalReleaseDate: tenDaysFromNow, status: 'ACTIVE IN' },
        cvl: {},
      } as CaseloadItem,
    ])

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
    ])
  })

  it('filters offenders who are ineligible for a licence', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348' },
      { offenderCrn: 'X12349' },
      { offenderCrn: 'X12350' },
      { offenderCrn: 'X12351' },
      { offenderCrn: 'X12352' },
      { offenderCrn: 'X12353' },
      { offenderCrn: 'X12354' },
      { offenderCrn: 'X12355' },
      { offenderCrn: 'X12356' },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234L', crn: 'X12351' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234M', crn: 'X12352' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234N', crn: 'X12353' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234P', crn: 'X12354' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234Q', crn: 'X12355' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234R', crn: 'X12356' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          paroleEligibilityDate: yesterday,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: { prisonerNumber: 'AB1234F', paroleEligibilityDate: tenDaysFromNow },
      },
      {
        prisoner: { prisonerNumber: 'AB1234G', legalStatus: 'DEAD' },
      },
      {
        prisoner: { prisonerNumber: 'AB1234H', indeterminateSentence: true },
      },
      {
        prisoner: { prisonerNumber: 'AB1234I' },
      },
      {
        prisoner: { prisonerNumber: 'AB1234J', conditionalReleaseDate: tenDaysFromNow },
      },
      {
        prisoner: { prisonerNumber: 'AB1234K', conditionalReleaseDate: tenDaysFromNow, bookingId: '123' },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234L',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      // This case tests that recalls are overridden if the PRRD < the conditionalReleaseDate - so NOT_STARTED
      {
        prisoner: {
          prisonerNumber: 'AB1234M',
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
      },
      // This case tests that recalls are NOT overridden if the PRRD > the conditionalReleaseDate - so OOS_RECALL
      {
        prisoner: {
          prisonerNumber: 'AB1234N',
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: elevenDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
      },
      // This case tests that recalls are overridden if the PRRD is equal to the conditionalReleaseDate - so NOT_STARTED
      {
        prisoner: {
          prisonerNumber: 'AB1234P',
          conditionalReleaseDate: nineDaysFromNow,
          postRecallReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
      },
      // This case tests that recalls are overridden if no PRRD exists and there is only the conditionalReleaseDate - so NOT_STARTED
      {
        prisoner: {
          prisonerNumber: 'AB1234Q',
          conditionalReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
      },
      // This case tests that the case is included when the status is INACTIVE TRN
      {
        prisoner: {
          prisonerNumber: 'AB1234R',
          conditionalReleaseDate: nineDaysFromNow,
          status: 'INACTIVE TRN',
        },
      },
    ] as CaseloadItem[])
    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '123',
        eligibleForHdc: true,
      } as HdcStatus,
    ])

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12351',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234L',
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          otherIds: {
            nomsNumber: 'AB1234M',
            crn: 'X12352',
          },
          offenderCrn: 'X12352',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234M',
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12353',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234N',
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: elevenDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
        licences: [
          {
            status: 'OOS_RECALL',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12354',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234P',
          conditionalReleaseDate: nineDaysFromNow,
          postRecallReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12355',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234Q',
          conditionalReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12356',
          otherIds: {
            crn: 'X12356',
            nomsNumber: 'AB1234R',
          },
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: nineDaysFromNow,
          prisonerNumber: 'AB1234R',
          status: 'INACTIVE TRN',
        },
      },
    ])
  })

  it('builds the staff create caseload', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12349', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12350', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12351', staff: { unallocated: true } },
      { offenderCrn: 'X12352', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234H', crn: 'X12351' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234I', crn: 'X12352' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'INACTIVE OUT',
        },
      },
      { prisoner: { prisonerNumber: 'AB1234G', conditionalReleaseDate: tenDaysFromNow } },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          topupSupervisionExpiryDate: '2023-06-22',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234I',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          topupSupervisionExpiryDate: '2023-06-22',
          licenceExpiryDate: elevenDaysFromNow,
        },
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234I',
        licenceId: 1,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'sherlockholmes',
        staffCode: 'X54321',
        staff: {
          forenames: 'Sherlock',
          surname: 'Holmes',
        },
      },
    ])

    const result = await serviceUnderTest.getStaffCreateCaseload(user)
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
          staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' },
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X12351',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
      },
      {
        deliusRecord: {
          offenderCrn: 'X12352',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234I',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: elevenDaysFromNow,
        },
        licences: [
          {
            id: 1,
            status: 'SUBMITTED',
            type: 'AP_PSS',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the team create caseload', async () => {
    communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12349', staff: { forenames: 'Sherlock', surname: 'Holmes', code: 'X54321' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'ACTIVE IN',
        },
      },
      { prisoner: { prisonerNumber: 'AB1234F', conditionalReleaseDate: tenDaysFromNow, status: 'ACTIVE IN' } },
    ] as CaseloadItem[])

    const result = await serviceUnderTest.getTeamCreateCaseload(user, ['teamA'])
    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamA')
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X12349',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
    expect(communityService.getManagedOffendersByTeam).toHaveBeenCalledTimes(1)
  })

  it('check licence status for recalls and breach of supervision on team create caseload', async () => {
    communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      { offenderCrn: 'X12349', staff: { forenames: 'Sherlock', surname: 'Holmes', code: 'X54321' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: tenDaysFromNow,
          releaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          releaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          imprisonmentStatus: 'BOTUS',
          recall: true,
        },
      },
    ] as CaseloadItem[])

    const result = await serviceUnderTest.getTeamCreateCaseload(user, ['teamB'])

    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamB')

    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          releaseDate: tenDaysFromNow,
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: tenDaysFromNow,
          recall: true,
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
      {
        deliusRecord: {
          offenderCrn: 'X12349',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234F',
          releaseDate: tenDaysFromNow,
          conditionalReleaseDate: tenDaysFromNow,
          imprisonmentStatus: 'BOTUS',
        },
        licences: [
          {
            status: 'OOS_BOTUS',
            type: 'PSS',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
    expect(communityService.getManagedOffendersByTeam).toHaveBeenCalledTimes(1)
  })

  it('builds the staff vary caseload', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'INACTIVE OUT',
        },
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        kind: 'CRD',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'sherlockholmes',
        staffCode: 'X54321',
        staff: {
          forenames: 'Sherlock',
          surname: 'Holmes',
        },
      },
    ])

    const result = await serviceUnderTest.getStaffVaryCaseload(user)

    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
        },
        licences: [
          {
            id: 1,
            status: 'VARIATION_IN_PROGRESS',
            type: 'AP',
            comUsername: 'sherlockholmes',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the staff vary caseload with Review Needed status', async () => {
    communityService.getManagedOffenders.mockResolvedValue([
      { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
    ])
    communityService.getOffendersByCrn.mockResolvedValue([
      { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'INACTIVE OUT',
        },
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        kind: 'HARD_STOP',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        comUsername: 'sherlockholmes',
        isReviewNeeded: true,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'sherlockholmes',
        staffCode: 'X54321',
        staff: {
          forenames: 'Sherlock',
          surname: 'Holmes',
        },
      },
    ])

    const result = await serviceUnderTest.getStaffVaryCaseload(user)

    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderCrn: 'X12348',
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
        },
        licences: [
          {
            id: 1,
            status: 'REVIEW_NEEDED',
            type: 'AP',
            comUsername: 'sherlockholmes',
          },
        ],
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  describe('#getTeamVaryCaseload', () => {
    beforeEach(() => {
      communityService.getOffendersByCrn.mockResolvedValue([
        { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
        { otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } } as OffenderDetail,
      ])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        { prisoner: { prisonerNumber: 'AB1234E', confirmedReleaseDate: tenDaysFromNow, status: 'INACTIVE OUT' } },
        {
          prisoner: {
            prisonerNumber: 'AB1234F',
            confirmedReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'INACTIVE OUT',
          },
        },
      ] as CaseloadItem[])
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        {
          kind: 'VARIATION',
          nomisId: 'AB1234E',
          licenceId: 1,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          comUsername: 'joebloggs',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
        },
        {
          kind: 'VARIATION',
          nomisId: 'AB1234F',
          licenceId: 2,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          comUsername: 'sherlockholmes',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
        },
      ])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([
        {
          username: 'sherlockholmes',
          staffCode: 'X54321',
          staff: {
            forenames: 'Sherlock',
            surname: 'Holmes',
          },
        },
        {
          username: 'joebloggs',
          staffCode: 'X1234',
          staff: {
            forenames: 'Joe',
            surname: 'Bloggs',
          },
        },
      ])
    })

    it('builds the team vary caseload', async () => {
      communityService.getManagedOffendersByTeam.mockResolvedValueOnce([
        { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
        { offenderCrn: 'X12349', staff: { forenames: 'Sherlock', surname: 'Holmes', code: 'X54321' } },
      ])

      const result = await serviceUnderTest.getTeamVaryCaseload(user)
      expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamA')
      expect(result).toMatchObject([
        {
          deliusRecord: {
            offenderCrn: 'X12348',
          },
          nomisRecord: {
            prisonerNumber: 'AB1234E',
            confirmedReleaseDate: tenDaysFromNow,
          },
          licences: [
            {
              id: 1,
              status: 'VARIATION_IN_PROGRESS',
              type: 'PSS',
              comUsername: 'joebloggs',
            },
          ],
          probationPractitioner: {
            staffCode: 'X1234',
            name: 'Joe Bloggs',
          },
        },
        {
          deliusRecord: {
            offenderCrn: 'X12349',
          },
          nomisRecord: {
            prisonerNumber: 'AB1234F',
            confirmedReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
          },
          licences: [
            {
              id: 2,
              status: 'VARIATION_IN_PROGRESS',
              type: 'AP',
              comUsername: 'sherlockholmes',
            },
          ],
          probationPractitioner: {
            staffCode: 'X54321',
            name: 'Sherlock Holmes',
          },
        },
      ])
    })

    it('builds the team vary caseload with Review Needed status', async () => {
      communityService.getManagedOffenders.mockResolvedValue([
        { offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } },
      ])
      communityService.getOffendersByCrn.mockResolvedValue([
        { otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } } as OffenderDetail,
      ])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            prisonerNumber: 'AB1234E',
            confirmedReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'INACTIVE OUT',
          },
        },
      ] as CaseloadItem[])
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        {
          nomisId: 'AB1234E',
          licenceId: 1,
          kind: 'HARD_STOP',
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.ACTIVE,
          comUsername: 'sherlockholmes',
          isReviewNeeded: true,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
        },
      ])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([
        {
          username: 'sherlockholmes',
          staffCode: 'X54321',
          staff: {
            forenames: 'Sherlock',
            surname: 'Holmes',
          },
        },
      ])

      const result = await serviceUnderTest.getStaffVaryCaseload(user)

      expect(result).toMatchObject([
        {
          deliusRecord: {
            offenderCrn: 'X12348',
          },
          nomisRecord: {
            prisonerNumber: 'AB1234E',
            confirmedReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
          },
          licences: [
            {
              id: 1,
              status: 'REVIEW_NEEDED',
              type: 'AP',
              comUsername: 'sherlockholmes',
            },
          ],
          probationPractitioner: {
            staffCode: 'X54321',
            name: 'Sherlock Holmes',
          },
        },
      ])
    })

    it('batches calls to the community CRN endpoint', async () => {
      communityService.getManagedOffendersByTeam.mockResolvedValue(
        Array(600).fill({ offenderCrn: 'X12348', staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } })
      )

      await serviceUnderTest.getTeamVaryCaseload(user)
      expect(communityService.getOffendersByCrn).toHaveBeenCalledTimes(2)
    })
  })

  it('OMU caseload', async () => {
    licenceService.getLicencesForOmu.mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234D',
        licenceId: 1,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.APPROVED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
      {
        kind: 'CRD',
        nomisId: 'AB1234E',
        licenceId: 2,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
      {
        kind: 'CRD',
        nomisId: 'AB1234G',
        licenceId: 3,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
      {
        kind: 'CRD',
        nomisId: 'AB1234F',
        licenceId: 4,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'joebloggs',
        versionOf: 2,
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    prisonerService.getHdcStatuses.mockResolvedValue([
      {
        bookingId: '1234',
        checksPassed: true,
        approvalStatus: 'APPROVED',
      },
      {
        bookingId: '12345',
        checksPassed: true,
        approvalStatus: 'PENDING',
      },
      {
        bookingId: '123456',
        checksPassed: true,
        approvalStatus: undefined,
      },
      {
        bookingId: '1234567',
        checksPassed: true,
        approvalStatus: 'APPROVED',
      },
    ] as HdcStatus[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234F',
        licenceId: 4,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'joebloggs',
        versionOf: 2,
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234G',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'OUT',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234I',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          topupSupervisionExpiryDate: '2023-12-26',
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234J',
          bookingId: '1234',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          homeDetentionCurfewEligibilityDate: undefined,
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234K',
          bookingId: '12345',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234L',
          bookingId: '123456',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234M',
          bookingId: '1234567',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          homeDetentionCurfewEligibilityDate: nineDaysFromNow,
        },
      },
    ] as CaseloadItem[])

    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      {
        otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234J', crn: 'X12352' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234K', crn: 'X12353' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234L', crn: 'X12354' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234M', crn: 'X12355' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
    ] as OffenderDetail[])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'joebloggs',
        staffCode: 'X1234',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      },
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234D',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234G',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'OUT',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'ACTIVE IN',
        },
      },
    ] as CaseloadItem[])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234I', crn: 'X12351' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234J', crn: 'X12352' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234K', crn: 'X12353' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234L', crn: 'X12354' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
      {
        otherIds: { nomsNumber: 'AB1234M', crn: 'X12355' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      },
    ] as OffenderDetail[])

    const result = await serviceUnderTest.getOmuCaseload(user, ['p1', 'p2'])

    expect(licenceService.searchPrisonersByReleaseDate).toHaveBeenCalledWith(
      startOfDay(new Date()),
      endOfDay(add(new Date(), { weeks: 4 })),
      ['p1', 'p2'],
      user
    )
    expect(result.cases.unwrap()).toMatchObject([
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12347',
            nomsNumber: 'AB1234D',
          },
        },
        licences: [
          {
            comUsername: 'joebloggs',
            dateCreated: undefined,
            id: 1,
            status: 'APPROVED',
            type: 'PSS',
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234D',
          status: 'ACTIVE IN',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12348',
            nomsNumber: 'AB1234E',
          },
        },
        licences: [
          {
            comUsername: 'joebloggs',
            dateCreated: undefined,
            id: 2,
            status: 'IN_PROGRESS',
            type: 'PSS',
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234E',
          status: 'ACTIVE IN',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12349',
            nomsNumber: 'AB1234F',
          },
        },
        licences: [
          {
            comUsername: 'joebloggs',
            dateCreated: undefined,
            id: 4,
            status: 'SUBMITTED',
            type: 'AP',
            versionOf: 2,
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          prisonerNumber: 'AB1234F',
          status: 'ACTIVE IN',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12350',
            nomsNumber: 'AB1234G',
          },
        },
        licences: [
          {
            comUsername: 'joebloggs',
            dateCreated: undefined,
            id: 3,
            status: 'ACTIVE',
            type: 'AP',
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          prisonerNumber: 'AB1234G',
          status: 'OUT',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12351',
            nomsNumber: 'AB1234I',
          },
          staff: {
            code: 'X1234',
            forenames: 'Joe',
            surname: 'Bloggs',
          },
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'AP_PSS',
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          topupSupervisionExpiryDate: '2023-12-26',
          prisonerNumber: 'AB1234I',
          status: 'ACTIVE IN',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12352',
            nomsNumber: 'AB1234J',
          },
          staff: {
            code: 'X1234',
            forenames: 'Joe',
            surname: 'Bloggs',
          },
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
        nomisRecord: {
          bookingId: '1234',
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234J',
          status: 'ACTIVE IN',
          homeDetentionCurfewEligibilityDate: undefined,
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12353',
            nomsNumber: 'AB1234K',
          },
          staff: {
            code: 'X1234',
            forenames: 'Joe',
            surname: 'Bloggs',
          },
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
        nomisRecord: {
          bookingId: '12345',
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234K',
          status: 'ACTIVE IN',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: {
                code: 'X1234',
                forenames: 'Joe',
                surname: 'Bloggs',
              },
            },
          ],
          otherIds: {
            crn: 'X12354',
            nomsNumber: 'AB1234L',
          },
          staff: {
            code: 'X1234',
            forenames: 'Joe',
            surname: 'Bloggs',
          },
        },
        licences: [
          {
            status: 'NOT_STARTED',
            type: 'PSS',
          },
        ],
        nomisRecord: {
          bookingId: '123456',
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234L',
          status: 'ACTIVE IN',
        },
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
    ])
  })

  it('returns exclusions', async () => {
    licenceService.getLicencesForOmu.mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234D',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.APPROVED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
      {
        kind: 'CRD',
        nomisId: 'AB1234E',
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
      {
        kind: 'HARD_STOP',
        nomisId: 'AB1234H',
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValueOnce([
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          legalStatus: 'DEAD',
        },
      },
    ] as CaseloadItem[])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      {
        otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
      {
        otherIds: { nomsNumber: 'AB1234H', crn: 'X12349' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'joebloggs',
        staffCode: 'X1234',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      },
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234D',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
      },
    ] as CaseloadItem[])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
      {
        otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        kind: 'CRD',
        nomisId: 'AB1234E',
        licenceId: 2,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])

    const result = await serviceUnderTest.getOmuCaseload(user, ['p1', 'p2'])

    expect(result.cases.exclusions()).toMatchObject([
      [{ deliusRecord: { otherIds: { crn: 'X12349', nomsNumber: 'AB1234F' } } }, 'is dead'],
    ])

    expect(result.cases.unwrap()).toMatchObject([
      { deliusRecord: { otherIds: { crn: 'X12347', nomsNumber: 'AB1234D' } } },
      { deliusRecord: { otherIds: { crn: 'X12348', nomsNumber: 'AB1234E' } } },
      { deliusRecord: { otherIds: { crn: 'X12349', nomsNumber: 'AB1234H' } } },
    ])
  })

  it('builds the vary approver caseload', async () => {
    licenceService.getLicencesForVariationApproval.mockResolvedValue([
      {
        kind: 'VARIATION',
        nomisId: 'AB1234E',
        licenceId: 1,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
      },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValue([
      {
        otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
          status: 'INACTIVE OUT',
        },
      } as CaseloadItem,
    ])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([
      {
        username: 'joebloggs',
        staffCode: 'X1234',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      },
    ])

    const result = await serviceUnderTest.getVaryApproverCaseload(user)

    expect(result).toMatchObject([
      {
        deliusRecord: {
          otherIds: {
            nomsNumber: 'AB1234E',
            crn: 'X12348',
          },
        },
        nomisRecord: {
          prisonerNumber: 'AB1234E',
          confirmedReleaseDate: tenDaysFromNow,
        },
        licences: [
          {
            id: 1,
            type: 'PSS',
            status: 'VARIATION_SUBMITTED',
            comUsername: 'joebloggs',
          },
        ],
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
    ])
  })

  describe('Is Parole Eligible', () => {
    it('returns FALSE when PED is not set', () => {
      expect(CaseloadService.isParoleEligible(null)).toBeFalsy()
    })
    it('returns TRUE when PED is in the future', () => {
      expect(CaseloadService.isParoleEligible(tenDaysFromNow)).toBeTruthy()
    })
    it('returns FALSE when PED is in the past', () => {
      expect(CaseloadService.isParoleEligible(yesterday)).toBeFalsy()
    })
    it('returns FALSE when PED is not valid', () => {
      expect(CaseloadService.isParoleEligible('aaa')).toBeFalsy()
    })
  })

  describe('#isEligibleEDS', () => {
    it('returns true when PED is not set', () => {
      expect(CaseloadService.isEligibleEDS(null, null, null, null)).toBe(true)
    })
    it('returns false when PED is set and CRD is not', () => {
      expect(CaseloadService.isEligibleEDS(yesterday, null, null, null)).toBe(false)
    })
    it('returns false when PED is in the future', () => {
      expect(CaseloadService.isEligibleEDS(nineDaysFromNow, tenDaysFromNow, null, null)).toBe(false)
    })
    it('returns true if past PED and ARD is within 4 days of CRD', () => {
      expect(
        CaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, format(addDays(new Date(), 6), 'yyyy-MM-dd'), null)
      ).toBe(true)
    })
    it('returns true if past PED and ARD is equal to CRD', () => {
      expect(CaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, tenDaysFromNow, null)).toBe(true)
    })
    it('returns false if past PED and ARD is more than 4 days before CRD', () => {
      expect(
        CaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, format(addDays(new Date(), 5), 'yyyy-MM-dd'), null)
      ).toBe(false)
    })
    it('returns true if past PED and ARD not set', () => {
      expect(CaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, null, null)).toBe(true)
    })
    it('returns false if APD is set', () => {
      expect(CaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, tenDaysFromNow, nineDaysFromNow)).toBe(false)
    })
  })
})
