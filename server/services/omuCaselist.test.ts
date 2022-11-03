import { add, sub, format } from 'date-fns'
import OmuCaselist from './omuCaselist'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import Container from './container'

describe('omu caselist', () => {
  it('should return prison view case', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const omuCaselist = createCaselist(LicenceStatus.SUBMITTED, today, '2022-10-19')

    expect(omuCaselist.getPrisonView()).toEqual({
      excludedItems: [],
      items: [
        {
          deliusRecord: {
            offenderId: 1,
          },
          licences: [
            {
              status: 'SUBMITTED',
              type: 'AP',
            },
          ],
          nomisRecord: {
            conditionalReleaseDate: '2022-10-19',
            confirmedReleaseDate: today,
            restrictedPatient: false,
            status: 'ACTIVE IN',
          },
        },
      ],
    })
  })

  it('should exclude for prison view as incorrect status', () => {
    const today = format(new Date(), 'yyyy-MM-dd')
    const omuCaselist = createCaselist(LicenceStatus.ACTIVE, today, '2022-10-19')

    expect(omuCaselist.getPrisonView()).toEqual({
      excludedItems: [
        [
          {
            deliusRecord: { offenderId: 1 },
            licences: [{ status: 'ACTIVE', type: 'AP' }],
            nomisRecord: {
              conditionalReleaseDate: '2022-10-19',
              confirmedReleaseDate: today,
              restrictedPatient: false,
              status: 'ACTIVE IN',
            },
          },
          'invalid status for prison view, not one NOT_STARTED,IN_PROGRESS,APPROVED,SUBMITTED',
        ],
      ],
      items: [],
    })
  })

  it('should return out of scope (OOS) case for prison view', () => {
    const futureDate = format(add(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
    const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, futureDate, '2022-10-19')

    expect(omuCaselist.getPrisonView()).toEqual({
      excludedItems: [],
      items: [
        {
          deliusRecord: { offenderId: 1 },
          licences: [{ status: 'OOS_BOTUS', type: 'AP' }],
          nomisRecord: {
            conditionalReleaseDate: '2022-10-19',
            confirmedReleaseDate: futureDate,
            restrictedPatient: false,
            status: 'ACTIVE IN',
          },
        },
      ],
    })
  })
  it('should exclude OOS case having a past CRD from prison view', () => {
    const pastDate = format(sub(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
    const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, pastDate, '2022-10-19')

    expect(omuCaselist.getPrisonView()).toEqual({
      excludedItems: [
        [
          {
            deliusRecord: { offenderId: 1 },
            licences: [{ status: 'OOS_BOTUS', type: 'AP' }],
            nomisRecord: {
              conditionalReleaseDate: '2022-10-19',
              confirmedReleaseDate: pastDate,
              restrictedPatient: false,
              status: 'ACTIVE IN',
            },
          },
          'is out of scope and in the past',
        ],
      ],
      items: [],
    })
  })

  it('should exclude OOS case with future conditional and past confirmed CRD from prison view', () => {
    const pastDate = format(sub(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
    const futureDate = format(add(new Date(), { weeks: 1 }), 'yyyy-MM-dd')
    const omuCaselist = createCaselist(LicenceStatus.OOS_BOTUS, pastDate, futureDate)

    expect(omuCaselist.getPrisonView()).toEqual({
      excludedItems: [
        [
          {
            deliusRecord: { offenderId: 1 },
            licences: [{ status: 'OOS_BOTUS', type: 'AP' }],
            nomisRecord: {
              conditionalReleaseDate: futureDate,
              confirmedReleaseDate: pastDate,
              restrictedPatient: false,
              status: 'ACTIVE IN',
            },
          },
          'is out of scope and in the past',
        ],
      ],
      items: [],
    })
  })

  it('should return probation view case', () => {
    const omuCaselist = createCaselist(LicenceStatus.VARIATION_IN_PROGRESS, '2022-10-27', '2022-11-10')

    expect(omuCaselist.getProbationView()).toEqual({
      excludedItems: [],
      items: [
        {
          deliusRecord: { offenderId: 1 },
          licences: [{ status: 'VARIATION_IN_PROGRESS', type: 'AP' }],
          nomisRecord: {
            conditionalReleaseDate: '2022-11-10',
            confirmedReleaseDate: '2022-10-27',
            restrictedPatient: false,
            status: 'ACTIVE IN',
          },
        },
      ],
    })
  })

  it('should exclude for probation view as incorrect status', () => {
    const omuCaselist = createCaselist(LicenceStatus.IN_PROGRESS, '2022-10-27', '2022-11-10')
    expect(omuCaselist.getProbationView()).toEqual({
      excludedItems: [
        [
          {
            deliusRecord: { offenderId: 1 },
            licences: [{ status: 'IN_PROGRESS', type: 'AP' }],
            nomisRecord: {
              conditionalReleaseDate: '2022-11-10',
              confirmedReleaseDate: '2022-10-27',
              restrictedPatient: false,
              status: 'ACTIVE IN',
            },
          },
          'invalid status for probation view, not one ACTIVE,VARIATION_IN_PROGRESS,VARIATION_APPROVED,VARIATION_SUBMITTED',
        ],
      ],
      items: [],
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
