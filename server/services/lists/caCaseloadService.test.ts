import { add, addDays, format, startOfDay, endOfDay, sub } from 'date-fns'
import PrisonerService from '../prisonerService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import HdcStatus from '../../@types/HdcStatus'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { Licence, ManagedCase } from '../../@types/managedCase'
import { CaseloadItem, CvlPrisoner, LicenceSummary } from '../../@types/licenceApiClientTypes'
import CaCaseloadService, { CaCase, CaCaseLoad } from './caCaseloadService'

jest.mock('../prisonerService')
jest.mock('../licenceService')
jest.mock('../communityService')

describe('Caseload Service', () => {
  const licenceSummary = {
    kind: 'CRD',
    nomisId: 'AB1234D',
    licenceId: 1,
    licenceType: LicenceType.AP,
    licenceStatus: LicenceStatus.APPROVED,
    comUsername: 'joebloggs',
    isReviewNeeded: false,
    isDueForEarlyRelease: false,
    isInHardStopPeriod: true,
    isDueToBeReleasedInTheNextTwoWorkingDays: true,
    updatedByFullName: 'X Y',
  } as LicenceSummary
  const offender = {
    otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
    offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
  } as OffenderDetail
  const twoDaysFromNow = format(addDays(new Date(), 2), 'yyyy-MM-dd')
  const caseloadItem = {
    prisoner: {
      prisonerNumber: 'AB1234D',
      conditionalReleaseDate: twoDaysFromNow,
      status: 'ACTIVE IN',
    },
    cvl: { isInHardStopPeriod: true },
  }
  const staffDetails = {
    username: 'joebloggs',
    staffCode: 'X1234',
    staff: {
      forenames: 'Joe',
      surname: 'Bloggs',
    },
  }
  const probationPractitioner = {
    name: 'Joe Bloggs',
    staffCode: 'X1234',
  }
  const aLicence = {
    comUsername: 'joebloggs',
    dateCreated: undefined,
    id: 1,
    status: LicenceStatus.APPROVED,
    type: 'PSS',
    updatedByFullName: 'X Y',
  } as Licence
  const caCase = {
    licenceId: 1,
    licenceVersionOf: undefined,
    name: 'John Cena',
    prisonerNumber: 'AB1234D',
    probationPractitioner,
    releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
    releaseDateLabel: 'CRD',
    licenceStatus: 'APPROVED',
    tabType: 'futureReleases',
    nomisLegalStatus: undefined,
    lastWorkedOnBy: 'X Y',
    isDueForEarlyRelease: false,
  } as CaCase
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const nineDaysFromNow = format(addDays(new Date(), 9), 'yyyy-MM-dd')
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const serviceUnderTest = new CaCaseloadService(prisonerService, communityService, licenceService)
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
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValue([])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([])
    licenceService.getLicencesForOmu.mockResolvedValue([])
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
          licences: [{ status: 'TIMED_OUT', type: 'PSS' }],
        },
      ])
    })
  })

  it('OMU caseload', async () => {
    licenceService.getLicencesForOmu.mockResolvedValue([
      {
        ...licenceSummary,
        licenceType: LicenceType.PSS,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
      {
        ...licenceSummary,
        nomisId: 'AB1234E',
        licenceId: 2,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
      {
        ...licenceSummary,
        nomisId: 'AB1234G',
        licenceId: 3,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
      {
        ...licenceSummary,
        nomisId: 'AB1234F',
        licenceId: 4,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.SUBMITTED,
        versionOf: 2,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        ...licenceSummary,
        nomisId: 'AB1234F',
        licenceId: 4,
        licenceStatus: LicenceStatus.SUBMITTED,
        versionOf: 2,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
      },
    ])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234G',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'OUT',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234I',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          topupSupervisionExpiryDate: '2023-12-26',
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234J',
          bookingId: '1234',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          homeDetentionCurfewEligibilityDate: undefined,
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234K',
          bookingId: '12345',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234L',
          bookingId: '123456',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234M',
          bookingId: '1234567',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
          homeDetentionCurfewEligibilityDate: nineDaysFromNow,
        },
        cvl: {},
      },
    ] as CaseloadItem[])

    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      { ...offender, otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234J', crn: 'X12352' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234K', crn: 'X12353' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234L', crn: 'X12354' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234M', crn: 'X12355' } },
    ] as OffenderDetail[])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([
      {
        prisoner: {
          prisonerNumber: 'AB1234D',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234E',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234F',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234G',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'OUT',
        },
        cvl: {},
      },
      {
        prisoner: {
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          status: 'ACTIVE IN',
        },
        cvl: {},
      },
    ] as CaseloadItem[])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      { ...offender, otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234I', crn: 'X12351' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234J', crn: 'X12352' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234K', crn: 'X12353' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234L', crn: 'X12354' } },
      { ...offender, otherIds: { nomsNumber: 'AB1234M', crn: 'X12355' } },
    ] as OffenderDetail[])

    const result = await serviceUnderTest.getOmuCaseload(user, user.prisonCaseload)

    expect(licenceService.searchPrisonersByReleaseDate).toHaveBeenCalledWith(
      startOfDay(new Date()),
      endOfDay(add(new Date(), { weeks: 4 })),
      user.prisonCaseload,
      user
    )
    expect(result).toMatchObject([
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12347',
            nomsNumber: 'AB1234D',
          },
        },
        licences: [aLicence],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234D',
          status: 'ACTIVE IN',
        },
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12348',
            nomsNumber: 'AB1234E',
          },
        },
        licences: [{ ...aLicence, id: 2, status: LicenceStatus.IN_PROGRESS }],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          prisonerNumber: 'AB1234E',
          status: 'ACTIVE IN',
        },
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12349',
            nomsNumber: 'AB1234F',
          },
        },
        licences: [{ ...aLicence, id: 4, status: LicenceStatus.SUBMITTED, type: LicenceType.AP, versionOf: 2 }],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          prisonerNumber: 'AB1234F',
          status: 'ACTIVE IN',
        },
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12350',
            nomsNumber: 'AB1234G',
          },
        },
        licences: [{ ...aLicence, id: 3, status: LicenceStatus.ACTIVE, type: LicenceType.AP }],
        nomisRecord: {
          conditionalReleaseDate: tenDaysFromNow,
          licenceExpiryDate: '2022-12-26',
          prisonerNumber: 'AB1234G',
          status: 'OUT',
        },
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12351',
            nomsNumber: 'AB1234I',
          },
          staff: staffDetails.staff,
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
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12352',
            nomsNumber: 'AB1234J',
          },
          staff: staffDetails.staff,
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
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12353',
            nomsNumber: 'AB1234K',
          },
          staff: staffDetails.staff,
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
        probationPractitioner,
      },
      {
        deliusRecord: {
          offenderManagers: [
            {
              active: true,
              staff: staffDetails.staff,
            },
          ],
          otherIds: {
            crn: 'X12354',
            nomsNumber: 'AB1234L',
          },
          staff: staffDetails.staff,
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
        probationPractitioner,
      },
    ])
  })

  it('Should exclude TIMED_OUT licences with ids, to prevent duplication', async () => {
    licenceService.getLicencesForOmu.mockResolvedValue([
      licenceSummary,
      { ...licenceSummary, licenceId: 2, licenceStatus: LicenceStatus.TIMED_OUT },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([offender])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([caseloadItem] as CaseloadItem[])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValueOnce([caseloadItem] as CaseloadItem[])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([offender])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      licenceSummary,
      { ...licenceSummary, licenceId: 2, licenceStatus: LicenceStatus.TIMED_OUT },
    ])

    const result = await serviceUnderTest.getOmuCaseload(user, ['p1', 'p2'])

    expect(result).toMatchObject([
      {
        deliusRecord: { otherIds: { crn: 'X12347', nomsNumber: 'AB1234D' } },
        licences: [{ id: 1 }, { id: 2 }],
      },
    ])
  })

  const futureDate = format(add(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
  const pastDate = format(sub(new Date(), { weeks: 1 }), 'yyyy-MM-dd')

  describe('isPrisonCase', () => {
    it('should return case for prison status and future CRD', () => {
      const c = createCase(LicenceStatus.SUBMITTED, futureDate, '2022-10-19')
      expect(serviceUnderTest.isPrisonCase(c)).toBe(true)
    })
    it('should return case for prison status and past CRD', () => {
      const c = createCase(LicenceStatus.SUBMITTED, pastDate, '2022-10-19')
      expect(serviceUnderTest.isPrisonCase(c)).toBe(true)
    })
    it('should return exclusion for probation status and future CRD', () => {
      const c = createCase(LicenceStatus.ACTIVE, futureDate, '2022-10-19')
      expect(serviceUnderTest.isPrisonCase(c)).toBe(false)
    })
    it('should return exclusion for probation status and past CRD', () => {
      const c = createCase(LicenceStatus.ACTIVE, pastDate, '2022-10-19')
      expect(serviceUnderTest.isPrisonCase(c)).toBe(false)
    })
    it('should return case for out-of-scope status and future CRD', () => {
      const c = createCase(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')
      expect(serviceUnderTest.isPrisonCase(c)).toBe(true)
    })
    it('should return exclusion for out-of-scope status and past CRD', () => {
      const c = createCase(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')
      expect(serviceUnderTest.isPrisonCase(c)).toBe(false)
    })
  })
  describe('isProbationCase', () => {
    it('should return case for probation status and future CRD', () => {
      const c = createCase(LicenceStatus.ACTIVE, futureDate, '2022-10-19')
      expect(serviceUnderTest.isProbationCase(c)).toBe(true)
    })
    it('should return case for probation status and past CRD', () => {
      const c = createCase(LicenceStatus.VARIATION_APPROVED, pastDate, '2022-10-19')
      expect(serviceUnderTest.isProbationCase(c)).toBe(true)
    })
    it('should return exclusion for prison status and future CRD', () => {
      const c = createCase(LicenceStatus.IN_PROGRESS, futureDate, '2022-10-19')
      expect(serviceUnderTest.isProbationCase(c)).toBe(false)
    })
    it('should return exclusion for prison status and past CRD', () => {
      const c = createCase(LicenceStatus.NOT_IN_PILOT, pastDate, '2022-10-19')
      expect(serviceUnderTest.isProbationCase(c)).toBe(false)
    })
    it('should return exclusion for out-of-scope status and future CRD', () => {
      const c = createCase(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')
      expect(serviceUnderTest.isProbationCase(c)).toBe(false)
    })
    it('should return exclusion for out-of-scope status and past CRD', () => {
      const c = createCase(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')
      expect(serviceUnderTest.isProbationCase(c)).toBe(false)
    })
  })

  describe('hasAnyStatusOf', () => {
    const PRISON_VIEW_STATUSES = [
      LicenceStatus.NOT_STARTED,
      LicenceStatus.IN_PROGRESS,
      LicenceStatus.APPROVED,
      LicenceStatus.SUBMITTED,
      LicenceStatus.TIMED_OUT,
    ]
    it('should return true if licence status is in provided statuses', () => {
      const managedCase = {
        licences: [{ status: LicenceStatus.NOT_STARTED }],
      } as ManagedCase
      expect(serviceUnderTest.hasAnyStatusOf(PRISON_VIEW_STATUSES, managedCase)).toBe(true)
    })

    it('should return false if licence status is not in provided statuses', () => {
      const managedCase = {
        licences: [{ status: LicenceStatus.ACTIVE }],
      } as ManagedCase
      expect(serviceUnderTest.hasAnyStatusOf(PRISON_VIEW_STATUSES, managedCase)).toBe(false)
    })
  })

  describe('isOutOfScope', () => {
    it('should return true if licence status is in OUT_OF_SCOPE_PRISON_VIEW_STATUSES', () => {
      const managedCase = {
        licences: [{ status: LicenceStatus.NOT_IN_PILOT }],
      } as ManagedCase
      expect(serviceUnderTest.isOutOfScope(managedCase)).toBe(true)
    })

    it('should return false if licence status is not in OUT_OF_SCOPE_PRISON_VIEW_STATUSES', () => {
      const managedCase = {
        licences: [{ status: LicenceStatus.ACTIVE }],
      } as ManagedCase
      expect(serviceUnderTest.isOutOfScope(managedCase)).toBe(false)
    })
  })

  describe('isReleaseInFuture', () => {
    it('should return true if ARD/CRD date is in feature', () => {
      const managedCase = {
        nomisRecord: { confirmedReleaseDate: futureDate },
      } as ManagedCase
      expect(serviceUnderTest.isReleaseInFuture(managedCase)).toBe(true)
    })

    it('should return false if ARD/CRD date is in past', () => {
      const managedCase = {
        nomisRecord: { confirmedReleaseDate: pastDate },
      } as ManagedCase
      expect(serviceUnderTest.isReleaseInFuture(managedCase)).toBe(false)
    })

    it('should return false if ARD/CRD date is today', () => {
      const managedCase = {
        nomisRecord: { confirmedReleaseDate: format(new Date(), 'yyyy-MM-dd') },
      } as ManagedCase
      expect(serviceUnderTest.isReleaseInFuture(managedCase)).toBe(false)
    })
  })

  describe('findLatestLicence', () => {
    it('should return the first element if the licences length is one', () => {
      const licences = {
        status: LicenceStatus.APPROVED,
      } as Licence
      expect(serviceUnderTest.findLatestLicence([licences])).toBe(licences)
    })

    it('should return the IN_PROGRESS licence if there are IN_PROGRESS and TIMED_OUT licences', () => {
      const licences = [
        {
          status: LicenceStatus.IN_PROGRESS,
        },
        {
          status: LicenceStatus.TIMED_OUT,
        },
      ] as Licence[]
      expect(serviceUnderTest.findLatestLicence(licences)).toBe(licences[0])
    })

    it('should return the IN_PROGRESS licence if there are IN_PROGRESS and SUBMITTED licences', () => {
      const licences = [
        {
          status: LicenceStatus.IN_PROGRESS,
        },
        {
          status: LicenceStatus.SUBMITTED,
        },
      ] as Licence[]
      expect(serviceUnderTest.findLatestLicence(licences)).toBe(licences[0])
    })
  })

  describe('CA Caseload,', () => {
    beforeEach(() => {
      licenceService.getLicencesForOmu.mockResolvedValue([
        {
          ...licenceSummary,
          licenceType: LicenceType.PSS,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: true,
        },
        {
          ...licenceSummary,
          nomisId: 'AB1234E',
          licenceId: 2,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          ...licenceSummary,
          nomisId: 'AB1234G',
          licenceId: 3,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.ACTIVE,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          ...licenceSummary,
          nomisId: 'AB1234F',
          licenceId: 4,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.SUBMITTED,
          versionOf: 2,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
          ...licenceSummary,
          nomisId: 'AB1234F',
          licenceId: 4,
          licenceStatus: LicenceStatus.SUBMITTED,
          versionOf: 2,
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
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234G',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'OUT',
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234H',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234I',
            conditionalReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            topupSupervisionExpiryDate: '2023-12-26',
            status: 'ACTIVE IN',
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234J',
            bookingId: '1234',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
            homeDetentionCurfewEligibilityDate: undefined,
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234K',
            bookingId: '12345',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234L',
            bookingId: '123456',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234M',
            bookingId: '1234567',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
            homeDetentionCurfewEligibilityDate: nineDaysFromNow,
          },
          cvl: {},
        },
      ] as CaseloadItem[])
      communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
        { ...offender, otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234J', crn: 'X12352' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234K', crn: 'X12353' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234L', crn: 'X12354' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234M', crn: 'X12355' } },
      ] as OffenderDetail[])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234D',
            conditionalReleaseDate: twoDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234F',
            conditionalReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234G',
            conditionalReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'OUT',
          },
          cvl: {},
        },
        {
          prisoner: {
            prisonerNumber: 'AB1234H',
            conditionalReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'ACTIVE IN',
          },
          cvl: {},
        },
      ] as CaseloadItem[])
      communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
        { ...offender, otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' } },
        { ...offender, otherIds: { nomsNumber: 'AB1234G', crn: 'X12350' } },
      ] as OffenderDetail[])
    })
    it('should return showAttentionNeededTab false along with caseload if there are no attention neeeded licences', async () => {
      expect(await serviceUnderTest.getPrisonView(user, user.prisonCaseload, '')).toMatchObject({
        cases: [
          { ...caCase, tabType: 'releasesInNextTwoWorkingDays' },
          {
            ...caCase,
            licenceId: 2,
            prisonerNumber: 'AB1234E',
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            licenceStatus: 'IN_PROGRESS',
          },
          {
            ...caCase,
            licenceId: 4,
            licenceVersionOf: 2,
            prisonerNumber: 'AB1234F',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'SUBMITTED',
          },
        ],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })

    it('should return showAttentionNeededTab true along with caseload if there are attention neeeded licences', async () => {
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234D',
            conditionalReleaseDate: '',
            status: 'ACTIVE IN',
            legalStatus: 'IMMIGRATION_DETAINEE',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234F',
            conditionalReleaseDate: tenDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
      ] as CaseloadItem[])
      expect(await serviceUnderTest.getPrisonView(user, user.prisonCaseload, '')).toMatchObject({
        cases: [
          {
            ...caCase,
            releaseDate: 'not found',
            tabType: 'attentionNeeded',
            nomisLegalStatus: 'IMMIGRATION_DETAINEE',
          },
          {
            ...caCase,
            licenceId: 2,
            prisonerNumber: 'AB1234E',
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            licenceStatus: 'IN_PROGRESS',
          },
          {
            ...caCase,
            licenceId: 4,
            licenceVersionOf: 2,
            prisonerNumber: 'AB1234F',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'SUBMITTED',
          },
        ],
        showAttentionNeededTab: true,
      } as CaCaseLoad)
    })

    it('should return filtered results', async () => {
      expect(await serviceUnderTest.getPrisonView(user, user.prisonCaseload, 'AB1234D')).toMatchObject({
        cases: [{ ...caCase, tabType: 'releasesInNextTwoWorkingDays' }],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })

    it('should return sorted results in ascending order', async () => {
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234D',
            conditionalReleaseDate: twoDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234F',
            conditionalReleaseDate: nineDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: 'ACTIVE IN',
          },
          cvl: { isDueForEarlyRelease: false },
        },
      ] as CaseloadItem[])
      expect(await serviceUnderTest.getPrisonView(user, user.prisonCaseload, '')).toMatchObject({
        cases: [
          {
            ...caCase,
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: undefined,
            releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
          },
          {
            ...caCase,
            licenceId: 4,
            licenceVersionOf: 2,
            prisonerNumber: 'AB1234F',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 9), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'SUBMITTED',
          },
          {
            ...caCase,
            licenceId: 2,
            prisonerNumber: 'AB1234E',
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            licenceStatus: 'IN_PROGRESS',
          },
        ],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })

    it('should return sorted results in descending order', async () => {
      licenceService.getLicencesForOmu.mockResolvedValue([
        {
          ...licenceSummary,
          licenceType: LicenceType.PSS,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: true,
        },
        {
          ...licenceSummary,
          nomisId: 'AB1234E',
          licenceId: 2,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.VARIATION_APPROVED,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          ...licenceSummary,
          nomisId: 'AB1234G',
          licenceId: 3,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.ACTIVE,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        {
          ...licenceSummary,
          nomisId: 'AB1234F',
          licenceId: 4,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          versionOf: 2,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
      ])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234G',
            conditionalReleaseDate: nineDaysFromNow,
            status: LicenceStatus.ACTIVE,
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: tenDaysFromNow,
            status: LicenceStatus.VARIATION_IN_PROGRESS,
          },
          cvl: { isDueForEarlyRelease: false },
        },
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234F',
            conditionalReleaseDate: twoDaysFromNow,
            licenceExpiryDate: '2022-12-26',
            status: LicenceStatus.VARIATION_APPROVED,
          },
          cvl: { isDueForEarlyRelease: false },
        },
      ] as CaseloadItem[])
      expect(await serviceUnderTest.getProbationView(user, user.prisonCaseload, '')).toMatchObject({
        cases: [
          {
            ...caCase,
            licenceId: 2,
            licenceStatus: 'VARIATION_APPROVED',
            prisonerNumber: 'AB1234E',
            tabType: 'futureReleases',
            nomisLegalStatus: undefined,
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
          },
          {
            ...caCase,
            licenceId: 3,
            prisonerNumber: 'AB1234G',
            releaseDate: format(addDays(new Date(), 9), 'dd MMM yyy'),
            licenceStatus: 'ACTIVE',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: undefined,
            kind: 'CRD',
            name: 'John Cena',
          },
          {
            ...caCase,
            licenceId: 4,
            licenceVersionOf: 2,
            prisonerNumber: 'AB1234F',
            releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'VARIATION_IN_PROGRESS',
          },
        ],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })
  })
})

function createCase(status: LicenceStatus, confirmedReleaseDate: string, conditionalReleaseDate: string): ManagedCase {
  return {
    deliusRecord: { offenderId: 1 },
    licences: [{ type: LicenceType.AP, status, isDueToBeReleasedInTheNextTwoWorkingDays: false, releaseDate: null }],
    cvlFields: {
      licenceType: 'AP',
      hardStopDate: '03/01/2023',
      hardStopWarningDate: '01/01/2023',
      isInHardStopPeriod: true,
      isDueForEarlyRelease: true,
      isDueToBeReleasedInTheNextTwoWorkingDays: false,
      isEligibleForEarlyRelease: false,
    },
    nomisRecord: {
      prisonerNumber: 'A1234AA',
      status: 'ACTIVE IN',
      confirmedReleaseDate,
      conditionalReleaseDate,
    } as CvlPrisoner,
  }
}
