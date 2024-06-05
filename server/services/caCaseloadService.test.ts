import { addDays, add, format, startOfDay, endOfDay } from 'date-fns'
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
import CaCaseloadService from './caCaseloadService'

jest.mock('./prisonerService')
jest.mock('./communityService')

describe('Caseload Service', () => {
  const tenDaysFromNow = format(addDays(new Date(), 10), 'yyyy-MM-dd')
  const nineDaysFromNow = format(addDays(new Date(), 9), 'yyyy-MM-dd')
  const twoDaysFromNow = format(addDays(new Date(), 2), 'yyyy-MM-dd')
  const yesterday = format(addDays(new Date(), -1), 'yyyy-MM-dd')
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
        cvlFields: {},
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

  describe('in the hard stop period', () => {
    it('Sets NOT_STARTED licences to TIMED_OUT when in the hard stop period', async () => {
      licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
      const offenders = new Container([
        {
          nomisRecord: { prisonerNumber: 'ABC123' },
          cvlFields: { isInHardStopPeriod: true },
        } as ManagedCase,
      ])
      const result = await serviceUnderTest.mapOffendersToLicences(offenders)
      expect(result.unwrap()).toMatchObject([
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
        kind: 'CRD',
        nomisId: 'AB1234D',
        licenceId: 1,
        licenceType: LicenceType.PSS,
        licenceStatus: LicenceStatus.APPROVED,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: false,
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
        updatedByFullName: 'X Y',
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
        updatedByFullName: 'X Y',
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
        updatedByFullName: 'X Y',
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
        updatedByFullName: 'X Y',
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
            updatedByFullName: 'X Y',
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
            updatedByFullName: 'X Y',
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
            updatedByFullName: 'X Y',
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
            updatedByFullName: 'X Y',
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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
          prisonerNumber: 'AB1234H',
          conditionalReleaseDate: tenDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: {},
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
        isDueToBeReleasedInTheNextTwoWorkingDays: false,
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

  it('Should exclude TIMED_OUT licences with ids, to prevent duplication', async () => {
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
        isInHardStopPeriod: true,
        isDueToBeReleasedInTheNextTwoWorkingDays: true,
      },
      {
        kind: 'CRD',
        nomisId: 'AB1234D',
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.TIMED_OUT,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: true,
        isDueToBeReleasedInTheNextTwoWorkingDays: true,
      },
    ])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      {
        otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
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
          conditionalReleaseDate: twoDaysFromNow,
          status: 'ACTIVE IN',
        },
        cvl: { isInHardStopPeriod: true },
      },
    ] as CaseloadItem[])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValueOnce([
      {
        prisoner: {
          prisonerNumber: 'AB1234D',
          conditionalReleaseDate: twoDaysFromNow,
          status: 'ACTIVE IN',
          legalStatus: 'SENTENCED',
        },
      },
    ] as CaseloadItem[])
    communityService.getOffendersByNomsNumbers.mockResolvedValueOnce([
      {
        otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
        offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Bloggs', code: 'X1234' } }],
      } as OffenderDetail,
    ])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([
      {
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
      },
      {
        kind: 'CRD',
        nomisId: 'AB1234D',
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.TIMED_OUT,
        comUsername: 'joebloggs',
        isReviewNeeded: false,
        isDueForEarlyRelease: false,
        isInHardStopPeriod: true,
        isDueToBeReleasedInTheNextTwoWorkingDays: true,
      },
    ])

    const result = await serviceUnderTest.getOmuCaseload(user, ['p1', 'p2'])

    expect(result.cases.exclusions()).toMatchObject([
      [
        {
          deliusRecord: { otherIds: { crn: 'X12347', nomsNumber: 'AB1234D' } },
          licences: [{ id: 1 }, { id: 2 }],
        },
        'Is a timed out IN_PROGRESS licence, will have been caught by earlier getLicencesForOmu',
      ],
    ])

    expect(result.cases.unwrap()).toMatchObject([
      {
        deliusRecord: { otherIds: { crn: 'X12347', nomsNumber: 'AB1234D' } },
        licences: [{ id: 1 }, { id: 2 }],
      },
    ])
  })

  describe('Is Parole Eligible', () => {
    it('returns FALSE when PED is not set', () => {
      expect(CaCaseloadService.isParoleEligible(null)).toBeFalsy()
    })
    it('returns TRUE when PED is in the future', () => {
      expect(CaCaseloadService.isParoleEligible(tenDaysFromNow)).toBeTruthy()
    })
    it('returns FALSE when PED is in the past', () => {
      expect(CaCaseloadService.isParoleEligible(yesterday)).toBeFalsy()
    })
    it('returns FALSE when PED is not valid', () => {
      expect(CaCaseloadService.isParoleEligible('aaa')).toBeFalsy()
    })
  })

  describe('#isEligibleEDS', () => {
    it('returns true when PED is not set', () => {
      expect(CaCaseloadService.isEligibleEDS(null, null, null, null)).toBe(true)
    })
    it('returns false when PED is set and CRD is not', () => {
      expect(CaCaseloadService.isEligibleEDS(yesterday, null, null, null)).toBe(false)
    })
    it('returns false when PED is in the future', () => {
      expect(CaCaseloadService.isEligibleEDS(nineDaysFromNow, tenDaysFromNow, null, null)).toBe(false)
    })
    it('returns true if past PED and ARD is within 4 days of CRD', () => {
      expect(
        CaCaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, format(addDays(new Date(), 6), 'yyyy-MM-dd'), null)
      ).toBe(true)
    })
    it('returns true if past PED and ARD is equal to CRD', () => {
      expect(CaCaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, tenDaysFromNow, null)).toBe(true)
    })
    it('returns false if past PED and ARD is more than 4 days before CRD', () => {
      expect(
        CaCaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, format(addDays(new Date(), 5), 'yyyy-MM-dd'), null)
      ).toBe(false)
    })
    it('returns true if past PED and ARD not set', () => {
      expect(CaCaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, null, null)).toBe(true)
    })
    it('returns false if APD is set', () => {
      expect(CaCaseloadService.isEligibleEDS(yesterday, tenDaysFromNow, tenDaysFromNow, nineDaysFromNow)).toBe(false)
    })
  })
})
