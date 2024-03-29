import { add, sub, format } from 'date-fns'
import OmuCaselist from './omuCaselist'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import Container from './container'

describe('omu caselist', () => {
  const futureDate = format(add(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
  const pastDate = format(sub(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
  describe('prison view', () => {
    it('should return case for prison status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.SUBMITTED, futureDate, '2022-10-19')
      expect(omuCaselist.getPrisonView().unwrap()).toHaveLength(1)
      expect(omuCaselist.getPrisonView().exclusions()).toHaveLength(0)
    })
    it('should return case for prison status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.SUBMITTED, pastDate, '2022-10-19')
      expect(omuCaselist.getPrisonView().unwrap()).toHaveLength(1)
      expect(omuCaselist.getPrisonView().exclusions()).toHaveLength(0)
    })
    it('should return exclusion for probation status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.ACTIVE, futureDate, '2022-10-19')
      expect(omuCaselist.getPrisonView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getPrisonView().exclusions()[0][1]).toStrictEqual(
        'invalid status for prison view, not one NOT_STARTED,IN_PROGRESS,APPROVED,SUBMITTED,TIMED_OUT'
      )
    })
    it('should return exclusion for probation status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.ACTIVE, pastDate, '2022-10-19')
      expect(omuCaselist.getPrisonView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getPrisonView().exclusions()[0][1]).toStrictEqual(
        'invalid status for prison view, not one NOT_STARTED,IN_PROGRESS,APPROVED,SUBMITTED,TIMED_OUT'
      )
    })
    it('should return case for out-of-scope status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')
      expect(omuCaselist.getPrisonView().unwrap()).toHaveLength(1)
      expect(omuCaselist.getPrisonView().exclusions()).toHaveLength(0)
    })

    it('should return exclusion for out-of-scope status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')
      expect(omuCaselist.getPrisonView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getPrisonView().exclusions()[0][1]).toStrictEqual('is out of scope and in the past')
    })
  })
  describe('probation view', () => {
    it('should return case for probation status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.ACTIVE, futureDate, '2022-10-19')
      expect(omuCaselist.getProbationView().unwrap()).toHaveLength(1)
      expect(omuCaselist.getProbationView().exclusions()).toHaveLength(0)
    })
    it('should return case for probation status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.VARIATION_APPROVED, pastDate, '2022-10-19')
      expect(omuCaselist.getProbationView().unwrap()).toHaveLength(1)
      expect(omuCaselist.getProbationView().exclusions()).toHaveLength(0)
    })
    it('should return exclusion for prison status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.IN_PROGRESS, futureDate, '2022-10-19')
      expect(omuCaselist.getProbationView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getProbationView().exclusions()[0][1]).toStrictEqual(
        'invalid status for probation view, not one ACTIVE,VARIATION_IN_PROGRESS,VARIATION_APPROVED,VARIATION_SUBMITTED'
      )
    })
    it('should return exclusion for prison status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.NOT_IN_PILOT, pastDate, '2022-10-19')
      expect(omuCaselist.getProbationView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getProbationView().exclusions()[0][1]).toStrictEqual(
        'invalid status for probation view, not one ACTIVE,VARIATION_IN_PROGRESS,VARIATION_APPROVED,VARIATION_SUBMITTED'
      )
    })
    it('should return exclusion for out-of-scope status and future CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')
      expect(omuCaselist.getProbationView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getProbationView().exclusions()[0][1]).toStrictEqual(
        'invalid status for probation view, not one ACTIVE,VARIATION_IN_PROGRESS,VARIATION_APPROVED,VARIATION_SUBMITTED'
      )
    })

    it('should return exclusion for out-of-scope status and past CRD', () => {
      const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')
      expect(omuCaselist.getProbationView().unwrap()).toHaveLength(0)
      expect(omuCaselist.getProbationView().exclusions()[0][1]).toStrictEqual(
        'invalid status for probation view, not one ACTIVE,VARIATION_IN_PROGRESS,VARIATION_APPROVED,VARIATION_SUBMITTED'
      )
    })
  })
})

function createCaselist(status: LicenceStatus, confirmedReleaseDate: string, conditionalReleaseDate: string) {
  return new OmuCaselist(
    new Container([
      {
        deliusRecord: { offenderId: 1 },
        licences: [{ type: LicenceType.AP, status }],
        nomisRecord: {
          status: 'ACTIVE IN',
          confirmedReleaseDate,
          conditionalReleaseDate,
          restrictedPatient: false,
        },
      },
    ])
  )
}
