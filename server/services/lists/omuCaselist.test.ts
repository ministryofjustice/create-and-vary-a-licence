import { add, sub, format } from 'date-fns'
import OmuCaselist from './omuCaselist'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import { CvlPrisoner } from '../../@types/licenceApiClientTypes'

describe('omu caselist', () => {
  const futureDate = format(add(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
  const pastDate = format(sub(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
  describe('prison view', () => {
    it('should return case for prison status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.SUBMITTED, futureDate, '2022-10-19')
      expect(omuCaselist.getPrisonView()).toHaveLength(1)
    })
    it('should return case for prison status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.SUBMITTED, pastDate, '2022-10-19')
      expect(omuCaselist.getPrisonView()).toHaveLength(1)
    })
    it('should return exclusion for probation status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.ACTIVE, futureDate, '2022-10-19')
      expect(omuCaselist.getPrisonView()).toHaveLength(0)
    })
    it('should return exclusion for probation status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.ACTIVE, pastDate, '2022-10-19')
      expect(omuCaselist.getPrisonView()).toHaveLength(0)
    })
    it('should return case for out-of-scope status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')
      expect(omuCaselist.getPrisonView()).toHaveLength(1)
    })

    it('should return exclusion for out-of-scope status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')
      expect(omuCaselist.getPrisonView()).toHaveLength(0)
    })
  })
  describe('probation view', () => {
    it('should return case for probation status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.ACTIVE, futureDate, '2022-10-19')
      expect(omuCaselist.getProbationView()).toHaveLength(1)
    })
    it('should return case for probation status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.VARIATION_APPROVED, pastDate, '2022-10-19')
      expect(omuCaselist.getProbationView()).toHaveLength(1)
    })
    it('should return exclusion for prison status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.IN_PROGRESS, futureDate, '2022-10-19')
      expect(omuCaselist.getProbationView()).toHaveLength(0)
    })
    it('should return exclusion for prison status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.NOT_IN_PILOT, pastDate, '2022-10-19')
      expect(omuCaselist.getProbationView()).toHaveLength(0)
    })
    it('should return exclusion for out-of-scope status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')
      expect(omuCaselist.getProbationView()).toHaveLength(0)
    })

    it('should return exclusion for out-of-scope status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')
      expect(omuCaselist.getProbationView()).toHaveLength(0)
    })
  })
})

function createCaselist(status: LicenceStatus, confirmedReleaseDate: string, conditionalReleaseDate: string) {
  return new OmuCaselist([
    {
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
    },
  ])
}
