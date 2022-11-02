import { add, sub } from 'date-fns'
import OmuCaselist from './omuCaselist'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { ManagedCase } from '../@types/managedCase'
import Container from './container'

const cases = [
  {
    deliusRecord: { offenderId: 1 },
    licences: [{ type: LicenceType.AP, status: LicenceStatus.SUBMITTED }],
    nomisRecord: {
      status: 'ACTIVE IN',
      confirmedReleaseDate: '2023-04-25',
      conditionalReleaseDate: '2023-02-19',
      restrictedPatient: false,
    },
  },
  {
    deliusRecord: { offenderId: 2 },
    licences: [{ type: LicenceType.AP, status: LicenceStatus.IN_PROGRESS }],
    nomisRecord: {
      status: 'ACTIVE IN',
      confirmedReleaseDate: '2023-04-25',
      conditionalReleaseDate: '2023-02-19',
      restrictedPatient: false,
    },
  },
  {
    deliusRecord: { offenderId: 3 },
    licences: [{ type: LicenceType.AP, status: LicenceStatus.ACTIVE }],
    nomisRecord: {
      status: 'OUT',
      confirmedReleaseDate: '2023-04-25',
      conditionalReleaseDate: '2023-02-19',
      restrictedPatient: false,
    },
  },
  {
    deliusRecord: { offenderId: 4 },
    licences: [{ type: LicenceType.AP, status: LicenceStatus.VARIATION_IN_PROGRESS }],
    nomisRecord: {
      status: 'ACTIVE OUT',
      confirmedReleaseDate: '2023-04-25',
      conditionalReleaseDate: '2023-02-19',
      restrictedPatient: false,
    },
  },
  {
    deliusRecord: { offenderId: 5 },
    licences: [{ type: LicenceType.AP, status: LicenceStatus.VARIATION_SUBMITTED }],
    nomisRecord: {
      status: 'ACTIVE OUT',
      confirmedReleaseDate: '2023-04-25',
      conditionalReleaseDate: '2023-02-19',
      restrictedPatient: false,
    },
  },
] as unknown as Container<ManagedCase>

describe('omu caselist', () => {
  it('should return prison view cases', () => {
    const omuCaselist = new OmuCaselist(cases)
    expect(omuCaselist.getPrisonView()).toEqual([
      {
        deliusRecord: { offenderId: 1 },
        licences: [{ status: 'SUBMITTED', type: 'AP' }],
        nomisRecord: {
          conditionalReleaseDate: '2023-02-19',
          confirmedReleaseDate: '2023-04-25',
          restrictedPatient: false,
          status: 'ACTIVE IN',
        },
      },
      {
        deliusRecord: { offenderId: 2 },
        licences: [{ status: 'IN_PROGRESS', type: 'AP' }],
        nomisRecord: {
          conditionalReleaseDate: '2023-02-19',
          confirmedReleaseDate: '2023-04-25',
          restrictedPatient: false,
          status: 'ACTIVE IN',
        },
      },
    ])
  })
  it('prison view cases should not include out of cases with past release date', () => {
    const oosCase = [
      {
        deliusRecord: { offenderId: 3 },
        licences: [{ type: LicenceType.AP, status: LicenceStatus.OOS_RECALL }],
        nomisRecord: {
          status: 'ACTIVE IN',
          confirmedReleaseDate: sub(new Date(), { weeks: 1 }),
          conditionalReleaseDate: '2023-02-19',
          restrictedPatient: false,
        },
      },
    ] as unknown as Container<ManagedCase>

    const omuCaselist = new OmuCaselist(oosCase)
    expect(omuCaselist.getPrisonView()).toEqual([])
  })
  it('prison view cases should include out of cases with future release date', () => {
    const futureDate = add(new Date(), { weeks: 1 })
    const oosCase = [
      {
        deliusRecord: { offenderId: 3 },
        licences: [{ type: LicenceType.AP, status: LicenceStatus.OOS_RECALL }],
        nomisRecord: {
          status: 'ACTIVE IN',
          confirmedReleaseDate: futureDate,
          conditionalReleaseDate: '2023-02-19',
          restrictedPatient: false,
        },
      },
    ] as unknown as Container<ManagedCase>

    const omuCaselist = new OmuCaselist(oosCase)
    expect(omuCaselist.getPrisonView()).toEqual([
      {
        deliusRecord: {
          offenderId: 3,
        },
        licences: [
          {
            status: 'OOS_RECALL',
            type: 'AP',
          },
        ],
        nomisRecord: {
          conditionalReleaseDate: '2023-02-19',
          confirmedReleaseDate: futureDate,
          restrictedPatient: false,
          status: 'ACTIVE IN',
        },
      },
    ])
  })
  it('should return probation view cases', () => {
    const omuCaselist = new OmuCaselist(cases)
    expect(omuCaselist.getProbationView()).toEqual([
      {
        deliusRecord: { offenderId: 3 },
        licences: [{ status: 'ACTIVE', type: 'AP' }],
        nomisRecord: {
          conditionalReleaseDate: '2023-02-19',
          confirmedReleaseDate: '2023-04-25',
          restrictedPatient: false,
          status: 'OUT',
        },
      },
      {
        deliusRecord: { offenderId: 4 },
        licences: [{ status: 'VARIATION_IN_PROGRESS', type: 'AP' }],
        nomisRecord: {
          conditionalReleaseDate: '2023-02-19',
          confirmedReleaseDate: '2023-04-25',
          restrictedPatient: false,
          status: 'ACTIVE OUT',
        },
      },
      {
        deliusRecord: { offenderId: 5 },
        licences: [{ status: 'VARIATION_SUBMITTED', type: 'AP' }],
        nomisRecord: {
          conditionalReleaseDate: '2023-02-19',
          confirmedReleaseDate: '2023-04-25',
          restrictedPatient: false,
          status: 'ACTIVE OUT',
        },
      },
    ])
  })
})
