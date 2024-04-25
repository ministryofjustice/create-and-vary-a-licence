import moment from 'moment'
import { addDays, subDays } from 'date-fns'
import { DeliusRecord, Licence, ManagedCase, ProbationPractitioner } from '../../@types/managedCase'
import LicenceKind from '../../enumeration/LicenceKind'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import createCaseloadViewModel from './CaseloadViewModel'
import config from '../../config'
import { parseIsoDate } from '../../utils/utils'
import type { CvlFields, CvlPrisoner } from '../../@types/licenceApiClientTypes'

describe('CaseloadViewModel', () => {
  let nomisRecord: CvlPrisoner
  let deliusRecord: DeliusRecord
  let probationPractitioner: ProbationPractitioner
  let licence: Licence
  let managedCases: ManagedCase[]

  beforeEach(() => {
    nomisRecord = {
      firstName: 'bob',
      lastName: 'smith',
      prisonerNumber: 'A1234BC',
      releaseDate: '2020-01-01',
      conditionalReleaseDate: '2020-01-02',
    } as CvlPrisoner

    deliusRecord = {
      offenderCrn: 'A123456',
    } as DeliusRecord

    probationPractitioner = {
      name: 'James Bond',
    } as ProbationPractitioner

    licence = {
      id: 1,
      status: LicenceStatus.IN_PROGRESS,
      type: LicenceType.AP,
      kind: LicenceKind.CRD,
      hardStopDate: subDays(parseIsoDate('2020-01-02'), 2),
      hardStopWarningDate: subDays(parseIsoDate('2020-01-02'), 4),
    } as Licence

    managedCases = [
      { nomisRecord, deliusRecord, probationPractitioner, licences: [licence] },
      { nomisRecord: nomisRecord2, deliusRecord: deliusRecord2, probationPractitioner, licences: [licence2] },
    ] as ManagedCase[]
  })

  const nomisRecord2 = {
    firstName: 'John',
    lastName: 'Johnson',
    prisonerNumber: 'D1234EF',
    releaseDate: '2020-01-01',
    conditionalReleaseDate: '2020-01-02',
  } as CvlPrisoner

  const deliusRecord2 = { offenderCrn: 'B789012' } as DeliusRecord

  const licence2 = {
    id: 2,
    status: LicenceStatus.APPROVED,
    type: LicenceType.AP_PSS,
    kind: LicenceKind.CRD,
    hardStopDate: subDays(parseIsoDate(nomisRecord2.releaseDate), 2),
    hardStopWarningDate: subDays(parseIsoDate(nomisRecord2.releaseDate), 4),
  } as Licence

  const cvlFields: CvlFields = {
    licenceType: LicenceType.AP,
    hardStopDate: '03/01/2023',
    hardStopWarningDate: '01/01/2023',
    isInHardStopPeriod: true,
    isDueForEarlyRelease: false,
  }

  it('titleizes name', () => {
    expect(
      createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0].name
    ).toEqual('Bob Smith')
  })

  it('prioritises release date over CRD', () => {
    expect(
      createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0].releaseDate
    ).toEqual(moment(nomisRecord.releaseDate).format('DD MMM YYYY'))
  })

  it('uses CRD if release date is not present on NOMIS record', () => {
    nomisRecord = { ...nomisRecord, releaseDate: null }
    expect(
      createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0].releaseDate
    ).toEqual(moment(nomisRecord.conditionalReleaseDate).format('DD MMM YYYY'))
  })

  describe('showHardStopWarning', () => {
    const existingConfig = config

    beforeAll(() => {
      config.hardStopEnabled = true
    })
    afterAll(() => {
      config.hardStopEnabled = existingConfig.hardStopEnabled
    })

    it('sets showHardStopWarning to true if now is between the warning and hard stop dates', () => {
      const now = new Date()
      licence = { ...licence, hardStopWarningDate: subDays(now, 1), hardStopDate: addDays(now, 1) }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].showHardStopWarning
      ).toEqual(true)
    })

    it('sets showHardStopWarning to true if now is equal to the warning date', () => {
      const now = new Date()
      licence = { ...licence, hardStopWarningDate: now, hardStopDate: addDays(now, 2) }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].showHardStopWarning
      ).toEqual(true)
    })

    it('sets showHardStopWarning to false if now is equal to the hardstop date', () => {
      const now = new Date()
      licence = { ...licence, hardStopWarningDate: subDays(now, 2), hardStopDate: now }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].showHardStopWarning
      ).toEqual(false)
    })

    it('sets showHardStopWarning to false if now is before window', () => {
      const now = new Date()
      licence = { ...licence, hardStopWarningDate: addDays(now, 1), hardStopDate: addDays(now, 3) }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].showHardStopWarning
      ).toEqual(false)
    })

    it('sets showHardStopWarning to false if the now is after window', () => {
      const now = new Date()
      licence = { ...licence, hardStopWarningDate: subDays(now, 3), hardStopDate: subDays(now, 1) }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].showHardStopWarning
      ).toEqual(false)
    })

    it('sets showHardStopWarning to false if hardStopEnabled is false', () => {
      config.hardStopEnabled = false
      const releaseDate = parseIsoDate(nomisRecord.releaseDate)
      licence = { ...licence, hardStopWarningDate: subDays(releaseDate, 1), hardStopDate: addDays(releaseDate, 1) }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].showHardStopWarning
      ).toEqual(false)
    })
  })

  it('copes with missing release dates', () => {
    expect(
      createCaseloadViewModel(
        [
          {
            nomisRecord: { ...nomisRecord, releaseDate: undefined, conditionalReleaseDate: undefined },
            deliusRecord,
            probationPractitioner: undefined,
            cvlFields,
            licences: [licence],
          },
        ],
        null
      )[0].releaseDate
    ).toEqual(undefined)
  })

  it('copes with sort dates', () => {
    // This shouldn't happen for PPs but can happen in support view
    expect(
      createCaseloadViewModel(
        [
          {
            nomisRecord: { ...nomisRecord, releaseDate: undefined, conditionalReleaseDate: undefined },
            deliusRecord,
            probationPractitioner: undefined,
            cvlFields,
            licences: [licence],
          },
        ],
        null
      )[0].releaseDate
    ).toEqual(undefined)
  })

  describe('isClickable', () => {
    it('should be false if the PP is undefined', () => {
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner: undefined, cvlFields, licences: [licence] }],
          null
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be false if the licence status is NOT_IN_PILOT', () => {
      licence = { ...licence, status: LicenceStatus.NOT_IN_PILOT }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be false if the licence is a recall', () => {
      licence = { ...licence, status: LicenceStatus.OOS_RECALL }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be false if the licence is a breach of supervision', () => {
      licence = { ...licence, status: LicenceStatus.OOS_BOTUS }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be true in any other case', () => {
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
          null
        )[0].isClickable
      ).toEqual(true)
    })
  })

  describe('search', () => {
    it('searches on CRN', () => {
      expect(createCaseloadViewModel(managedCases, 'A123456')).toEqual([
        {
          name: 'Bob Smith',
          crnNumber: 'A123456',
          prisonerNumber: 'A1234BC',
          releaseDate: '01 Jan 2020',
          hardStopDate: '31 Dec 2019',
          licenceId: 1,
          licenceStatus: 'IN_PROGRESS',
          licenceType: 'AP',
          probationPractitioner,
          createLink: '/licence/create/id/1/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
          sortDate: parseIsoDate('2020-01-01'),
        },
      ])
    })

    it('searches on name', () => {
      expect(createCaseloadViewModel(managedCases, 'john')).toEqual([
        {
          name: 'John Johnson',
          crnNumber: 'B789012',
          prisonerNumber: 'D1234EF',
          releaseDate: '01 Jan 2020',
          hardStopDate: '30 Dec 2019',
          licenceId: 2,
          licenceStatus: 'APPROVED',
          licenceType: 'AP_PSS',
          probationPractitioner,
          createLink: '/licence/create/id/2/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
          sortDate: parseIsoDate('2020-01-01'),
        },
      ])
    })

    it('searches on PP name', () => {
      expect(createCaseloadViewModel(managedCases, 'bond')).toEqual([
        {
          name: 'Bob Smith',
          crnNumber: 'A123456',
          prisonerNumber: 'A1234BC',
          releaseDate: '01 Jan 2020',
          hardStopDate: '31 Dec 2019',
          licenceId: 1,
          licenceStatus: 'IN_PROGRESS',
          licenceType: 'AP',
          probationPractitioner,
          createLink: '/licence/create/id/1/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
          sortDate: parseIsoDate('2020-01-01'),
        },
        {
          name: 'John Johnson',
          crnNumber: 'B789012',
          prisonerNumber: 'D1234EF',
          releaseDate: '01 Jan 2020',
          hardStopDate: '30 Dec 2019',
          licenceId: 2,
          licenceStatus: 'APPROVED',
          licenceType: 'AP_PSS',
          probationPractitioner,
          createLink: '/licence/create/id/2/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
          sortDate: parseIsoDate('2020-01-01'),
        },
      ])
    })
  })

  it('sorts based on CRD', () => {
    nomisRecord = { ...nomisRecord, releaseDate: null, conditionalReleaseDate: '2020-02-02' }
    managedCases = [
      { nomisRecord, deliusRecord, probationPractitioner, licences: [licence] },
      { nomisRecord: nomisRecord2, deliusRecord: deliusRecord2, probationPractitioner, licences: [licence2] },
    ] as ManagedCase[]
    expect(createCaseloadViewModel(managedCases, 'bond')).toEqual([
      {
        name: 'John Johnson',
        crnNumber: 'B789012',
        prisonerNumber: 'D1234EF',
        releaseDate: '01 Jan 2020',
        hardStopDate: '30 Dec 2019',
        licenceId: 2,
        licenceStatus: 'APPROVED',
        licenceType: 'AP_PSS',
        probationPractitioner,
        createLink: '/licence/create/id/2/check-your-answers',
        isClickable: true,
        showHardStopWarning: false,
        sortDate: parseIsoDate('2020-01-01'),
      },
      {
        name: 'Bob Smith',
        crnNumber: 'A123456',
        prisonerNumber: 'A1234BC',
        releaseDate: moment('2020-02-02').format('DD MMM YYYY'),
        hardStopDate: '31 Dec 2019',
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
        licenceType: 'AP',
        probationPractitioner,
        createLink: '/licence/create/id/1/check-your-answers',
        isClickable: true,
        showHardStopWarning: false,
        sortDate: parseIsoDate('2020-02-02'),
      },
    ])
  })

  describe('findLicenceAndCreateLinkToDisplay', () => {
    it('returns not approved in time link if the licence is timed out and is an edit of an existing approved licence', () => {
      const licence1 = { ...licence, id: 1, status: LicenceStatus.APPROVED }
      const licence2 = { ...licence, id: 2, status: LicenceStatus.TIMED_OUT, versionOf: 1 }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence2, licence1] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/1/licence-changes-not-approved-in-time')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns prison-will-create link if the licence is timed out, it is not an edit, and a hard stop licence has not been started', () => {
      licence = { ...licence, status: LicenceStatus.TIMED_OUT }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns prison-will-create link if the licence timed out and a hard stop licence is IN_PROGRESS', () => {
      const licence1 = {
        ...licence,
        id: 2,
        kind: LicenceKind.HARD_STOP,
        status: LicenceStatus.IN_PROGRESS,
        versionOf: 1,
      }
      const licence2 = { ...licence, status: LicenceStatus.TIMED_OUT }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence1, licence2] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns prison-will-create link if the licence was not started and the hard-stop licence is IN_PROGRESS', () => {
      licence = { ...licence, kind: LicenceKind.HARD_STOP, status: LicenceStatus.IN_PROGRESS }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns created-by-prison link if the licence kind is HARD_STOP and the licence status is not IN_PROGRESS', () => {
      const licence1 = { ...licence, id: 2, kind: LicenceKind.HARD_STOP, status: LicenceStatus.SUBMITTED, versionOf: 1 }
      const licence2 = { ...licence, status: LicenceStatus.TIMED_OUT }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence1, licence2] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/2/licence-created-by-prison')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns created-by-prison link if the licence kind is HARD_STOP and the licence status is not IN_PROGRESS, when the original licence was NOT_STARTED', () => {
      const licence1 = { ...licence, id: 2, kind: LicenceKind.HARD_STOP, status: LicenceStatus.SUBMITTED }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence1] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/2/licence-created-by-prison')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns the create licence link if the licence has not been started', () => {
      licence = { ...licence, id: undefined, status: LicenceStatus.NOT_STARTED, type: LicenceType.AP }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/confirm')
      expect(licenceViewModel.licenceStatus).toEqual('NOT_STARTED')
    })

    it('returns check-your-answers link if the licence is in any other state', () => {
      licence = { ...licence }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, cvlFields, licences: [licence] }],
        null
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/1/check-your-answers')
      expect(licenceViewModel.licenceStatus).toEqual('IN_PROGRESS')
    })
  })
})
