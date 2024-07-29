import { addDays, format, parse } from 'date-fns'
import PrisonerService from '../prisonerService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import HdcStatus from '../../@types/HdcStatus'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { ManagedCase } from '../../@types/managedCase'
import { CaseloadItem } from '../../@types/licenceApiClientTypes'
import ComCaseloadService from './comCaseloadService'
import { convertDateFormat } from '../../utils/utils'

jest.mock('../prisonerService')
jest.mock('../communityService')

describe('COM Caseload Service', () => {
  const elevenDaysFromNow = format(addDays(new Date(), 11), 'yyyy-MM-dd')
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const nineDaysFromNow = format(addDays(new Date(), 9), 'yyyy-MM-dd')
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new ComCaseloadService(communityService, licenceService, prisonerService)
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
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('Does not call Licence API when no Nomis records are found', async () => {
    const offenders = [
      {
        nomisRecord: { prisonerNumber: null },
        cvlFields: {},
      } as ManagedCase,
    ]
    await serviceUnderTest.mapOffendersToLicences(offenders)
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(0)
  })

  it('Calls Licence API when Nomis records are found', async () => {
    const offenders = [
      {
        nomisRecord: { prisonerNumber: 'ABC123', conditionalReleaseDate: tenDaysFromNow },
        cvlFields: { hardStopDate: '03/02/2023', hardStopWarningDate: '01/02/2023' },
      } as ManagedCase,
    ]
    await serviceUnderTest.mapOffendersToLicences(offenders)
    expect(licenceService.getLicencesByNomisIdsAndStatus).toHaveBeenCalledTimes(1)
  })

  describe('in the hard stop period', () => {
    it('Sets NOT_STARTED licences to TIMED_OUT when in the hard stop period', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
      const offenders = [
        {
          nomisRecord: { prisonerNumber: 'ABC123' },
          cvlFields: { isInHardStopPeriod: true },
        } as ManagedCase,
      ]
      const result = await serviceUnderTest.mapOffendersToLicences(offenders)
      expect(result).toMatchObject([
        {
          nomisRecord: {
            prisonerNumber: 'ABC123',
          },
          cvlFields: { isInHardStopPeriod: true },
          licences: [{ nomisId: 'ABC123', status: 'TIMED_OUT', type: 'PSS' }],
        },
      ])
    })
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
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
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
        cvl: {},
      },
      {
        prisoner: { prisonerNumber: 'AB1234F', paroleEligibilityDate: tenDaysFromNow, cvl: {} },
      },
      {
        prisoner: { prisonerNumber: 'AB1234G', legalStatus: 'DEAD', cvl: {} },
      },
      {
        prisoner: { prisonerNumber: 'AB1234H', indeterminateSentence: true, cvl: {} },
      },
      {
        prisoner: { prisonerNumber: 'AB1234I', cvl: {} },
      },
      {
        prisoner: { prisonerNumber: 'AB1234J', conditionalReleaseDate: tenDaysFromNow, cvl: {} },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234K',
          conditionalReleaseDate: tenDaysFromNow,
          bookingId: '123',
          cvl: {},
        },
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234L',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
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
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234N',
          conditionalReleaseDate: tenDaysFromNow,
          postRecallReleaseDate: elevenDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
        cvl: {},
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
        cvl: {},
      },
      // This case tests that recalls are overridden if no PRRD exists and there is only the conditionalReleaseDate - so NOT_STARTED
      {
        prisoner: {
          prisonerNumber: 'AB1234Q',
          conditionalReleaseDate: nineDaysFromNow,
          status: 'ACTIVE IN',
          recall: true,
        },
        cvl: {},
      },
      // This case tests that the case is included when the status is INACTIVE TRN
      {
        prisoner: {
          prisonerNumber: 'AB1234R',
          conditionalReleaseDate: nineDaysFromNow,
          status: 'INACTIVE TRN',
        },
        cvl: {},
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
        crnNumber: 'X12354',
        prisonerNumber: 'AB1234P',
        releaseDate: convertDateFormat(nineDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
      },
      {
        crnNumber: 'X12355',
        prisonerNumber: 'AB1234Q',
        releaseDate: convertDateFormat(nineDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
      },
      {
        crnNumber: 'X12356',
        prisonerNumber: 'AB1234R',
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
        releaseDate: convertDateFormat(nineDaysFromNow),
      },
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
      },
      {
        crnNumber: 'X12351',
        prisonerNumber: 'AB1234L',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
      },
      {
        crnNumber: 'X12352',
        prisonerNumber: 'AB1234M',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
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
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'INACTIVE OUT',
        },
        cvl: {},
      },
      { prisoner: { prisonerNumber: 'AB1234G', conditionalReleaseDate: tenDaysFromNow }, cvl: {} },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          topupSupervisionExpiryDate: '2023-06-22',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234I',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          topupSupervisionExpiryDate: '2023-06-22',
          licenceExpiryDate: elevenDaysFromNow,
        },
        cvl: {},
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        kind: 'CRD',
        crn: 'X12352',
        nomisId: 'AB1234I',
        licenceId: 1,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.SUBMITTED,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'AP',
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X1234',
        },
      },
      {
        crnNumber: 'X12351',
        prisonerNumber: 'AB1234H',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
      },
      {
        crnNumber: 'X12352',
        prisonerNumber: 'AB1234I',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceId: 1,
        licenceStatus: 'SUBMITTED',
        licenceType: 'AP_PSS',
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
        cvl: {},
      },
      {
        prisoner: { prisonerNumber: 'AB1234F', conditionalReleaseDate: tenDaysFromNow, status: 'ACTIVE IN' },
        cvl: {},
      },
    ] as CaseloadItem[])

    const result = await serviceUnderTest.getTeamCreateCaseload(user, ['teamA'])
    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamA')
    expect(result).toMatchObject([
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'AP',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
        },
      },
      {
        crnNumber: 'X12349',
        prisonerNumber: 'AB1234F',
        releaseDate: convertDateFormat(tenDaysFromNow),
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
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
        cvl: {},
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
        cvl: {},
      },
    ] as CaseloadItem[])

    const result = await serviceUnderTest.getTeamCreateCaseload(user, ['teamB'])

    expect(communityService.getManagedOffendersByTeam).toHaveBeenNthCalledWith(1, 'teamB')

    const expectedReleaseDate = format(parse(tenDaysFromNow, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
    expect(result).toMatchObject([
      {
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        releaseDate: expectedReleaseDate,
        licenceStatus: 'NOT_STARTED',
        licenceType: 'PSS',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Joe Bloggs',
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
        cvl: {},
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        crn: 'X12348',
        licenceId: 1,
        kind: 'CRD',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
      {
        nomisId: 'AB1234E',
        crn: 'X12348',
        licenceId: 2,
        kind: 'CRD',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        licenceId: 2,
        licenceStatus: 'VARIATION_IN_PROGRESS',
        licenceType: 'AP',
        probationPractitioner: {
          staffCode: 'X54321',
          name: 'Sherlock Holmes',
        },
      },
    ])
  })

  it('builds the staff vary caseload, ignoring any timed out licences', async () => {
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
        cvl: {},
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        licenceId: 1,
        kind: 'CRD',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.TIMED_OUT,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
      {
        nomisId: 'AB1234E',
        crn: 'X12348',
        licenceId: 2,
        kind: 'CRD',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
      {
        nomisId: 'AB1234E',
        crn: 'X12348',
        licenceId: 3,
        kind: 'CRD',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
        comUsername: 'sherlockholmes',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        licenceId: 3,
        licenceStatus: 'VARIATION_IN_PROGRESS',
        licenceType: 'AP',
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
        cvl: {},
      },
    ] as CaseloadItem[])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
        nomisId: 'AB1234E',
        crn: 'X12348',
        licenceId: 1,
        kind: 'HARD_STOP',
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        comUsername: 'sherlockholmes',
        isReviewNeeded: true,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        crnNumber: 'X12348',
        prisonerNumber: 'AB1234E',
        licenceId: 1,
        licenceStatus: 'REVIEW_NEEDED',
        licenceType: 'AP',
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
        {
          prisoner: { prisonerNumber: 'AB1234E', confirmedReleaseDate: tenDaysFromNow, status: 'INACTIVE OUT' },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234F',
            confirmedReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'INACTIVE OUT',
          },
          cvl: {},
        },
      ] as CaseloadItem[])
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        {
          kind: 'VARIATION',
          nomisId: 'AB1234E',
          crn: 'X12348',
          licenceId: 1,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          comUsername: 'joebloggs',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          kind: 'VARIATION',
          nomisId: 'AB1234F',
          crn: 'X12349',
          licenceId: 2,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          comUsername: 'sherlockholmes',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
          crnNumber: 'X12348',
          prisonerNumber: 'AB1234E',
          licenceId: 1,
          licenceStatus: 'VARIATION_IN_PROGRESS',
          licenceType: 'PSS',
          probationPractitioner: {
            staffCode: 'X1234',
            name: 'Joe Bloggs',
          },
        },
        {
          crnNumber: 'X12349',
          prisonerNumber: 'AB1234F',
          licenceId: 2,
          licenceStatus: 'VARIATION_IN_PROGRESS',
          licenceType: 'AP',
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
          cvl: {},
        },
      ] as CaseloadItem[])
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
        {
          nomisId: 'AB1234E',
          crn: 'X12348',
          licenceId: 1,
          kind: 'HARD_STOP',
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.ACTIVE,
          comUsername: 'sherlockholmes',
          isReviewNeeded: true,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
          crnNumber: 'X12348',
          prisonerNumber: 'AB1234E',
          licenceId: 1,
          licenceStatus: 'REVIEW_NEEDED',
          licenceType: 'AP',
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
})
