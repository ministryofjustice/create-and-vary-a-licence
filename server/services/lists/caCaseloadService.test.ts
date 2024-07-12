import { add, addDays, format, startOfDay, endOfDay, addMonths, subDays } from 'date-fns'
import PrisonerService from '../prisonerService'
import CommunityService from '../communityService'
import LicenceService from '../licenceService'
import { User } from '../../@types/CvlUserDetails'
import { OffenderDetail } from '../../@types/probationSearchApiClientTypes'
import HdcStatus from '../../@types/HdcStatus'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { CaseloadItem, LicenceSummary } from '../../@types/licenceApiClientTypes'
import CaCaseloadService, { CaCase, CaCaseLoad } from './caCaseloadService'

jest.mock('../prisonerService')
jest.mock('../licenceService')
jest.mock('../communityService')

describe('Caseload Service', () => {
  const today = new Date()
  const oneDayFromNow = format(addDays(today, 1), 'yyyy-MM-dd')
  const twoDaysFromNow = format(addDays(today, 2), 'yyyy-MM-dd')
  const twoDaysFromNowCvlFormat = format(addDays(today, 2), 'dd/MM/yyyy')
  const tenDaysFromNow = format(addDays(today, 10), 'yyyy-MM-dd')
  const tenDaysFromNowCvlFormat = format(addDays(today, 10), 'dd/MM/yyyy')
  const nineDaysFromNowCvlFormat = format(addDays(today, 9), 'dd/MM/yyyy')
  const twoMonthsFromNow = format(addMonths(today, 2), 'yyyy-MM-dd')
  const twoMonthsFromNowCvlFormat = format(addMonths(today, 2), 'dd/MM/yyyy')
  const licenceSummary = {
    kind: 'CRD',
    nomisId: 'AB1234D',
    forename: 'John',
    surname: 'Cena',
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
    communityService.getOffendersByCrn.mockResolvedValue([])
    communityService.getStaffDetailsByUsernameList.mockResolvedValue([])
    prisonerService.getHdcStatuses.mockResolvedValue([])
    licenceService.getLicencesByNomisIdsAndStatus.mockResolvedValue([])
    licenceService.searchPrisonersByReleaseDate.mockResolvedValue([])
    licenceService.searchPrisonersByNomsIds.mockResolvedValue([])
    licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])
    licenceService.getPostReleaseLicencesForOmu.mockResolvedValue([])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })
  describe('prison tab caseload', () => {
    beforeEach(() => {
      licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234D',
            conditionalReleaseDate: oneDayFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: true,
            isDueToBeReleasedInTheNextTwoWorkingDays: true,
          },
        },
        {
          prisoner: {
            firstName: 'Steve',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: twoMonthsFromNow,
            confirmedReleaseDate: twoDaysFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
        {
          prisoner: {
            firstName: 'Phil',
            lastName: 'Cena',
            prisonerNumber: 'AB1234F',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
      ] as CaseloadItem[])

      licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([
        {
          ...licenceSummary,
          forename: 'Steve',
          surname: 'Cena',
          nomisId: 'AB1234E',
          licenceId: 2,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: true,
          conditionalReleaseDate: twoMonthsFromNowCvlFormat,
          actualReleaseDate: twoDaysFromNowCvlFormat,
          isDueForEarlyRelease: true,
        },
        {
          ...licenceSummary,
          forename: 'Dave',
          surname: 'Cena',
          nomisId: 'AB1234G',
          licenceId: 3,
          licenceType: LicenceType.AP_PSS,
          licenceStatus: LicenceStatus.SUBMITTED,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          conditionalReleaseDate: twoMonthsFromNowCvlFormat,
        },
      ])
      prisonerService.getHdcStatuses.mockResolvedValue([
        {
          bookingId: '1234',
          checksPassed: true,
          approvalStatus: 'APPROVED',
        },
      ] as HdcStatus[])

      communityService.getOffendersByNomsNumbers.mockResolvedValue([
        {
          ...offender,
          otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
        },
        {
          ...offender,
          otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' },
        },
      ] as OffenderDetail[])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'Steve',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: twoMonthsFromNow,
            confirmedReleaseDate: twoDaysFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
        {
          prisoner: {
            firstName: 'Dave',
            lastName: 'Cena',
            prisonerNumber: 'AB1234G',
            conditionalReleaseDate: twoMonthsFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
      ] as CaseloadItem[])
    })

    describe('in the hard stop period', () => {
      it('Sets NOT_STARTED licences to TIMED_OUT when in the hard stop period', async () => {
        licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])
        const nomisRecord = {
          prisoner: {
            prisonerNumber: 'ABC123',
            firstName: 'John',
            lastName: 'Doe',
            legalStatus: 'SENTENCED',
            status: 'ACTIVE IN',
            conditionalReleaseDate: twoDaysFromNow,
          },
          cvl: {
            isInHardStopPeriod: true,
            isDueForEarlyRelease: false,
          },
        } as CaseloadItem
        licenceService.searchPrisonersByReleaseDate.mockResolvedValue([nomisRecord])
        communityService.getOffendersByNomsNumbers.mockResolvedValue([
          {
            ...offender,
            otherIds: { nomsNumber: 'ABC123', crn: 'X12345' },
          },
        ])

        const result = await serviceUnderTest.getPrisonOmuCaseload(user, ['BAI'])
        expect(result).toMatchObject({
          cases: [
            {
              name: 'John Doe',
              prisonerNumber: 'ABC123',
              nomisLegalStatus: 'SENTENCED',
              licenceStatus: 'TIMED_OUT',
              releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
              releaseDateLabel: 'CRD',
              probationPractitioner,
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
              tabType: 'futureReleases',
            },
          ],
          showAttentionNeededTab: false,
        } as CaCaseLoad)
      })
    })

    describe('findLatestLicenceSummary', () => {
      it('should return the first element if the licences length is one', () => {
        const licences = {
          licenceStatus: LicenceStatus.APPROVED,
        } as LicenceSummary
        expect(serviceUnderTest.findLatestLicenceSummary([licences])).toBe(licences)
      })

      it('should return the IN_PROGRESS licence if there are IN_PROGRESS and TIMED_OUT licences', () => {
        const licences = [
          {
            licenceStatus: LicenceStatus.IN_PROGRESS,
          },
          {
            licenceStatus: LicenceStatus.TIMED_OUT,
          },
        ] as LicenceSummary[]
        expect(serviceUnderTest.findLatestLicenceSummary(licences)).toBe(licences[0])
      })

      it('should return the IN_PROGRESS licence if there are IN_PROGRESS and SUBMITTED licences', () => {
        const licences = [
          {
            licenceStatus: LicenceStatus.IN_PROGRESS,
          },
          {
            licenceStatus: LicenceStatus.SUBMITTED,
          },
        ] as LicenceSummary[]
        expect(serviceUnderTest.findLatestLicenceSummary(licences)).toBe(licences[0])
      })
    })

    describe('splitCasesByComDetails', () => {
      const caseWithComUsername = { probationPractitioner: { staffUsername: 'ABC123' } } as CaCase
      const caseWithComCode = { probationPractitioner: { staffCode: 'DEF456' } } as CaCase
      const caseWithNoComId = { probationPractitioner: {} } as CaCase
      it('initialises params to empty arrays if there are no relevant cases', () => {
        expect(serviceUnderTest.splitCasesByComDetails([caseWithComUsername])).toEqual({
          withStaffCode: [],
          withStaffUsername: [caseWithComUsername],
          withNoComId: [],
        })
        expect(serviceUnderTest.splitCasesByComDetails([caseWithComCode])).toEqual({
          withStaffCode: [caseWithComCode],
          withStaffUsername: [],
          withNoComId: [],
        })
        expect(serviceUnderTest.splitCasesByComDetails([caseWithNoComId])).toEqual({
          withStaffCode: [],
          withStaffUsername: [],
          withNoComId: [caseWithNoComId],
        })
      })
    })

    describe('applySearch', () => {
      it('should successfully search by name', async () => {
        expect(await serviceUnderTest.getPrisonOmuCaseload(user, user.prisonCaseload, 'John')).toMatchObject({
          cases: [
            {
              name: 'John Cena',
              prisonerNumber: 'AB1234D',
              probationPractitioner,
              releaseDate: format(addDays(new Date(), 1), 'dd MMM yyy'),
              releaseDateLabel: 'CRD',
              licenceStatus: 'TIMED_OUT',
              tabType: 'releasesInNextTwoWorkingDays',
              nomisLegalStatus: 'SENTENCED',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
            },
          ],
          showAttentionNeededTab: false,
        } as CaCaseLoad)
      })

      it('should successfully search by prison number', async () => {
        expect(await serviceUnderTest.getPrisonOmuCaseload(user, user.prisonCaseload, 'AB1234D')).toMatchObject({
          cases: [
            {
              name: 'John Cena',
              prisonerNumber: 'AB1234D',
              probationPractitioner,
              releaseDate: format(addDays(new Date(), 1), 'dd MMM yyy'),
              releaseDateLabel: 'CRD',
              licenceStatus: 'TIMED_OUT',
              tabType: 'releasesInNextTwoWorkingDays',
              nomisLegalStatus: 'SENTENCED',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: true,
            },
          ],
          showAttentionNeededTab: false,
        } as CaCaseLoad)
      })

      it('should successfully search by probation practitioner', async () => {
        communityService.getOffendersByNomsNumbers.mockResolvedValue([
          {
            otherIds: { nomsNumber: 'AB1234D', crn: 'X12347' },
            offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Cloggs', code: 'X1235' } }],
          },
          {
            otherIds: { nomsNumber: 'AB1234F', crn: 'X12349' },
            offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Cloggs', code: 'X1235' } }],
          },
        ] as OffenderDetail[])
        expect(await serviceUnderTest.getPrisonOmuCaseload(user, user.prisonCaseload, 'Bloggs')).toMatchObject({
          cases: [
            {
              kind: 'CRD',
              licenceId: 2,
              name: 'Steve Cena',
              prisonerNumber: 'AB1234E',
              probationPractitioner,
              releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
              releaseDateLabel: 'Confirmed release date',
              licenceStatus: 'IN_PROGRESS',
              tabType: 'releasesInNextTwoWorkingDays',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'X Y',
              isDueForEarlyRelease: true,
              isInHardStopPeriod: false,
            },
            {
              kind: 'CRD',
              licenceId: 3,
              name: 'Dave Cena',
              prisonerNumber: 'AB1234G',
              probationPractitioner,
              releaseDate: format(addMonths(new Date(), 2), 'dd MMM yyy'),
              releaseDateLabel: 'CRD',
              licenceStatus: 'SUBMITTED',
              tabType: 'futureReleases',
              nomisLegalStatus: 'SENTENCED',
              lastWorkedOnBy: 'X Y',
              isDueForEarlyRelease: false,
              isInHardStopPeriod: false,
            },
          ],
          showAttentionNeededTab: false,
        } as CaCaseLoad)
      })
    })

    it('should query for cases being released within 4 weeks', async () => {
      await serviceUnderTest.getPrisonOmuCaseload(user, ['BAI'])
      expect(licenceService.searchPrisonersByReleaseDate).toHaveBeenCalledWith(
        startOfDay(today),
        endOfDay(add(today, { weeks: 4 })),
        ['BAI'],
        user
      )
    })

    it('should filter out duplicate cases, prioritising existing licences', async () => {
      licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
        {
          prisoner: {
            firstName: 'Steve',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: twoMonthsFromNow,
            confirmedReleaseDate: twoDaysFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        } as CaseloadItem,
      ])
      licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([
        {
          ...licenceSummary,
          forename: 'Steve',
          surname: 'Cena',
          nomisId: 'AB1234E',
          licenceId: 2,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: true,
          conditionalReleaseDate: twoMonthsFromNowCvlFormat,
          actualReleaseDate: twoDaysFromNowCvlFormat,
          isDueForEarlyRelease: true,
        },
      ])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'Steve',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            conditionalReleaseDate: twoMonthsFromNow,
            confirmedReleaseDate: twoDaysFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
      ] as CaseloadItem[])

      expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
        cases: [
          {
            kind: 'CRD',
            licenceId: 2,
            name: 'Steve Cena',
            prisonerNumber: 'AB1234E',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: 'IN_PROGRESS',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
          },
        ],
        showAttentionNeededTab: false,
      })
    })

    it('should return showAttentionNeededTab false along with caseload if there are no attention needed licences', async () => {
      expect(await serviceUnderTest.getPrisonOmuCaseload(user, user.prisonCaseload)).toMatchObject({
        cases: [
          {
            name: 'John Cena',
            prisonerNumber: 'AB1234D',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 1), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'TIMED_OUT',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: true,
          },
          {
            kind: 'CRD',
            licenceId: 2,
            name: 'Steve Cena',
            prisonerNumber: 'AB1234E',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: 'IN_PROGRESS',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
          },
          {
            name: 'Phil Cena',
            prisonerNumber: 'AB1234F',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'NOT_STARTED',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            kind: 'CRD',
            licenceId: 3,
            name: 'Dave Cena',
            prisonerNumber: 'AB1234G',
            probationPractitioner,
            releaseDate: format(addMonths(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'SUBMITTED',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
          },
        ],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })

    it('should return showAttentionNeededTab true along with caseload if there are attention needed licences', async () => {
      licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
        {
          prisoner: {
            firstName: 'John',
            lastName: 'Cena',
            prisonerNumber: 'AB1234D',
            conditionalReleaseDate: null,
            status: 'ACTIVE IN',
            legalStatus: 'IMMIGRATION_DETAINEE',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
        {
          prisoner: {
            firstName: 'Steve',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            status: 'ACTIVE IN',
            legalStatus: 'IMMIGRATION_DETAINEE',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: true,
            isDueToBeReleasedInTheNextTwoWorkingDays: true,
          },
        },
        {
          prisoner: {
            firstName: 'Phil',
            lastName: 'Cena',
            prisonerNumber: 'AB1234F',
            conditionalReleaseDate: tenDaysFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
      ] as CaseloadItem[])
      licenceService.searchPrisonersByNomsIds.mockResolvedValue([
        {
          prisoner: {
            firstName: 'Steve',
            lastName: 'Cena',
            prisonerNumber: 'AB1234E',
            status: 'ACTIVE IN',
            legalStatus: 'IMMIGRATION_DETAINEE',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
        {
          prisoner: {
            firstName: 'Dave',
            lastName: 'Cena',
            prisonerNumber: 'AB1234G',
            conditionalReleaseDate: twoMonthsFromNow,
            status: 'ACTIVE IN',
            legalStatus: 'SENTENCED',
          },
          cvl: {
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        },
      ] as CaseloadItem[])
      licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([
        {
          ...licenceSummary,
          forename: 'Steve',
          nomisId: 'AB1234E',
          licenceId: 2,
          licenceType: LicenceType.AP_PSS,
          licenceStatus: LicenceStatus.APPROVED,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          isDueForEarlyRelease: false,
        },
        {
          ...licenceSummary,
          forename: 'Dave',
          nomisId: 'AB1234G',
          licenceId: 3,
          licenceType: LicenceType.AP_PSS,
          licenceStatus: LicenceStatus.SUBMITTED,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          conditionalReleaseDate: twoMonthsFromNowCvlFormat,
        },
      ])
      expect(await serviceUnderTest.getPrisonOmuCaseload(user, user.prisonCaseload)).toMatchObject({
        cases: [
          {
            kind: 'CRD',
            licenceId: 2,
            name: 'Steve Cena',
            prisonerNumber: 'AB1234E',
            probationPractitioner,
            releaseDate: 'not found',
            releaseDateLabel: 'CRD',
            licenceStatus: 'APPROVED',
            tabType: 'attentionNeeded',
            nomisLegalStatus: 'IMMIGRATION_DETAINEE',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
          },
          {
            name: 'Phil Cena',
            prisonerNumber: 'AB1234F',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'NOT_STARTED',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            kind: 'CRD',
            licenceId: 3,
            name: 'Dave Cena',
            prisonerNumber: 'AB1234G',
            probationPractitioner,
            releaseDate: format(addMonths(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'SUBMITTED',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
          },
        ],
        showAttentionNeededTab: true,
      } as CaCaseLoad)
    })

    it('should return sorted results in ascending order', async () => {
      expect(await serviceUnderTest.getPrisonOmuCaseload(user, user.prisonCaseload, '')).toMatchObject({
        cases: [
          {
            name: 'John Cena',
            prisonerNumber: 'AB1234D',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 1), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'TIMED_OUT',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: true,
          },
          {
            kind: 'CRD',
            licenceId: 2,
            name: 'Steve Cena',
            prisonerNumber: 'AB1234E',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'Confirmed release date',
            licenceStatus: 'IN_PROGRESS',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: true,
            isInHardStopPeriod: false,
          },
          {
            name: 'Phil Cena',
            prisonerNumber: 'AB1234F',
            probationPractitioner,
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'NOT_STARTED',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
          },
          {
            kind: 'CRD',
            licenceId: 3,
            name: 'Dave Cena',
            prisonerNumber: 'AB1234G',
            probationPractitioner,
            releaseDate: format(addMonths(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'SUBMITTED',
            tabType: 'futureReleases',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'X Y',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
          },
        ],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })

    describe('filtering rules', () => {
      beforeEach(() => {
        licenceService.searchPrisonersByReleaseDate.mockResolvedValue([])
        licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])
        licenceService.searchPrisonersByNomsIds.mockResolvedValue([])
        communityService.getOffendersByNomsNumbers.mockResolvedValue([
          {
            otherIds: { nomsNumber: 'AB1234E', crn: 'X12348' },
            offenderManagers: [{ active: true, staff: { forenames: 'Joe', surname: 'Cloggs', code: 'X1235' } }],
          },
        ] as OffenderDetail[])
      })

      describe('NOT_STARTED licences', () => {
        it('should filter out cases with a future PED', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'ACTIVE IN',
                legalStatus: 'SENTENCED',
                paroleEligibilityDate: twoDaysFromNow,
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('Should filter out cases with a legal status of "DEAD"', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'ACTIVE IN',
                legalStatus: 'DEAD',
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should filter out cases on an indeterminate sentence', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'ACTIVE IN',
                legalStatus: 'SENTENCED',
                indeterminateSentence: true,
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should filter out cases with no CRD', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: null,
                status: 'ACTIVE IN',
                legalStatus: 'SENTENCED',
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should filter out cases with a status that does not begin with ACTIVE or INACTIVE TRN', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'INACTIVE OUT',
                legalStatus: 'SENTENCED',
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should filter out cases passed their release date', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: format(subDays(new Date(), 2), 'yyyy-MM-dd'),
                status: 'ACTIVE IN',
                legalStatus: 'SENTENCED',
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should filter out cases that are on an ineligible EDS', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'ACTIVE IN',
                legalStatus: 'SENTENCED',
                actualParoleDate: twoDaysFromNow,
                paroleEligibilityDate: twoDaysFromNow,
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should filter out cases with an approved HDC licence and HDCED', async () => {
          licenceService.searchPrisonersByReleaseDate.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'ACTIVE IN',
                legalStatus: 'SENTENCED',
                homeDetentionCurfewEligibilityDate: twoDaysFromNow,
                bookingId: '1234',
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            } as CaseloadItem,
          ])

          prisonerService.getHdcStatuses.mockResolvedValue([
            {
              bookingId: '1234',
              checksPassed: true,
              approvalStatus: 'APPROVED',
            },
          ] as HdcStatus[])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })

        it('should not filter out cases with an unapproved HDC licence', async () => {})

        it('should not filter out cases with an approved HDC licence but no HDCED', async () => {})
      })

      describe('existing licences', () => {
        it('should filter out cases with a legal status of "DEAD"', async () => {
          licenceService.getPreReleaseLicencesForOmu.mockResolvedValue([
            {
              ...licenceSummary,
              forename: 'Steve',
              surname: 'Cena',
              nomisId: 'AB1234E',
              licenceId: 2,
              licenceType: LicenceType.PSS,
              licenceStatus: LicenceStatus.IN_PROGRESS,
              isInHardStopPeriod: false,
              isDueToBeReleasedInTheNextTwoWorkingDays: true,
              conditionalReleaseDate: twoMonthsFromNowCvlFormat,
              actualReleaseDate: twoDaysFromNowCvlFormat,
              isDueForEarlyRelease: true,
            },
          ])
          licenceService.searchPrisonersByNomsIds.mockResolvedValue([
            {
              prisoner: {
                firstName: 'Steve',
                lastName: 'Cena',
                prisonerNumber: 'AB1234E',
                conditionalReleaseDate: twoMonthsFromNow,
                confirmedReleaseDate: twoDaysFromNow,
                status: 'ACTIVE IN',
                legalStatus: 'DEAD',
              },
              cvl: {
                isDueForEarlyRelease: true,
                isInHardStopPeriod: false,
                isDueToBeReleasedInTheNextTwoWorkingDays: false,
              },
            },
          ] as CaseloadItem[])

          expect(await serviceUnderTest.getPrisonOmuCaseload(user, [])).toEqual({
            cases: [],
            showAttentionNeededTab: false,
          })
        })
      })
    })
  })

  describe('probation tab caseload', () => {
    it('should return sorted results in descending order', async () => {
      licenceService.getPostReleaseLicencesForOmu.mockResolvedValue([
        {
          kind: 'CRD',
          nomisId: 'AB1234E',
          forename: 'Steve',
          surname: 'Cena',
          licenceId: 2,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.VARIATION_APPROVED,
          comUsername: 'joebloggs',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          updatedByFullName: 'X Y',
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          actualReleaseDate: twoMonthsFromNowCvlFormat,
        },
        {
          kind: 'CRD',
          nomisId: 'AB1234D',
          forename: 'John',
          surname: 'Cena',
          licenceId: 1,
          licenceType: LicenceType.PSS,
          licenceStatus: LicenceStatus.ACTIVE,
          comUsername: 'joebloggs',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          updatedByFullName: 'X Y',
          conditionalReleaseDate: tenDaysFromNowCvlFormat,
        },
        {
          kind: 'CRD',
          nomisId: 'AB1234F',
          forename: 'Phil',
          surname: 'Cena',
          licenceId: 4,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
          comUsername: 'joebloggs',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          updatedByFullName: 'X Y',
          conditionalReleaseDate: nineDaysFromNowCvlFormat,
        },
        {
          kind: 'CRD',
          nomisId: 'AB1234G',
          forename: 'Dave',
          surname: 'Cena',
          licenceId: 3,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.ACTIVE,
          comUsername: 'joebloggs',
          isReviewNeeded: false,
          isDueForEarlyRelease: false,
          isInHardStopPeriod: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
          updatedByFullName: 'X Y',
          conditionalReleaseDate: twoDaysFromNowCvlFormat,
        },
      ])
      communityService.getStaffDetailsByUsernameList.mockResolvedValue([staffDetails])

      expect(await serviceUnderTest.getProbationOmuCaseload(user, user.prisonCaseload, '')).toMatchObject({
        cases: [
          {
            licenceId: 2,
            licenceStatus: 'VARIATION_APPROVED',
            prisonerNumber: 'AB1234E',
            releaseDate: format(addMonths(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'Confirmed release date',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            kind: 'CRD',
            name: 'Steve Cena',
            probationPractitioner,
            lastWorkedOnBy: 'X Y',
          },
          {
            licenceId: 1,
            prisonerNumber: 'AB1234D',
            releaseDate: format(addDays(new Date(), 10), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'ACTIVE',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            kind: 'CRD',
            name: 'John Cena',
            probationPractitioner,
            lastWorkedOnBy: 'X Y',
          },
          {
            licenceId: 4,
            prisonerNumber: 'AB1234F',
            releaseDate: format(addDays(new Date(), 9), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'VARIATION_IN_PROGRESS',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            kind: 'CRD',
            name: 'Phil Cena',
            probationPractitioner,
            lastWorkedOnBy: 'X Y',
          },
          {
            licenceId: 3,
            prisonerNumber: 'AB1234G',
            releaseDate: format(addDays(new Date(), 2), 'dd MMM yyy'),
            releaseDateLabel: 'CRD',
            licenceStatus: 'ACTIVE',
            isDueForEarlyRelease: false,
            isInHardStopPeriod: false,
            kind: 'CRD',
            name: 'Dave Cena',
            probationPractitioner,
            lastWorkedOnBy: 'X Y',
          },
        ],
        showAttentionNeededTab: false,
      } as CaCaseLoad)
    })
  })
})
