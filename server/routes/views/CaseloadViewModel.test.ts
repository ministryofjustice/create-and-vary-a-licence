import moment from 'moment'
import { addDays, parse, subDays } from 'date-fns'
import { DeliusRecord, Licence, ManagedCase, ProbationPractitioner } from '../../@types/managedCase'
import { Prisoner } from '../../@types/prisonerSearchApiClientTypes'
import LicenceKind from '../../enumeration/LicenceKind'
import LicenceStatus from '../../enumeration/licenceStatus'
import LicenceType from '../../enumeration/licenceType'
import createCaseloadViewModel from './CaseloadViewModel'
import config from '../../config'

describe('CaseloadViewModel', () => {
  let nomisRecord: Prisoner
  let deliusRecord: DeliusRecord
  let probationPractitioner: ProbationPractitioner
  let licence: Licence
  let managedCases: ManagedCase[]
  let hardStopDates: { hardStopCutoffDate: Date; hardStopWarningDate: Date }

  beforeEach(() => {
    nomisRecord = {
      firstName: 'bob',
      lastName: 'smith',
      prisonerNumber: 'A1234BC',
      releaseDate: '2020-01-01',
      conditionalReleaseDate: '2020-01-02',
    } as Prisoner

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
    } as Licence

    managedCases = [
      { nomisRecord, deliusRecord, probationPractitioner, licences: [licence] },
      { nomisRecord: nomisRecord2, deliusRecord: deliusRecord2, probationPractitioner, licences: [licence2] },
    ] as ManagedCase[]

    hardStopDates = {
      hardStopCutoffDate: addDays(new Date(), 4),
      hardStopWarningDate: addDays(new Date(), 2),
    }
  })

  const nomisRecord2 = {
    firstName: 'John',
    lastName: 'Johnson',
    prisonerNumber: 'D1234EF',
    releaseDate: '2020-01-01',
    conditionalReleaseDate: '2020-01-02',
  } as Prisoner
  const deliusRecord2 = { offenderCrn: 'B789012' } as DeliusRecord
  const licence2 = { id: 2, status: LicenceStatus.APPROVED, type: LicenceType.AP_PSS, kind: LicenceKind.CRD } as Licence

  it('titleizes name', () => {
    expect(
      createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
        null,
        hardStopDates
      )[0].name
    ).toEqual('Bob Smith')
  })

  it('prioritises release date over CRD', () => {
    expect(
      createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
        null,
        hardStopDates
      )[0].releaseDate
    ).toEqual(moment(nomisRecord.releaseDate).format('DD MMM YYYY'))
  })

  it('uses CRD if release date is not present on NOMIS record', () => {
    nomisRecord = { ...nomisRecord, releaseDate: null }
    expect(
      createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
        null,
        hardStopDates
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

    it('sets showHardStopWarning to true if the release date is between the warning and cutoff dates', () => {
      const releaseDate = parse(nomisRecord.releaseDate, 'yyyy-MM-dd', new Date())
      hardStopDates = { hardStopWarningDate: subDays(releaseDate, 1), hardStopCutoffDate: addDays(releaseDate, 1) }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].showHardStopWarning
      ).toEqual(true)
    })

    it('sets showHardStopWarning to true if the release date is equal to the warning date', () => {
      const releaseDate = parse(nomisRecord.releaseDate, 'yyyy-MM-dd', new Date())
      hardStopDates = { hardStopWarningDate: releaseDate, hardStopCutoffDate: addDays(releaseDate, 2) }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].showHardStopWarning
      ).toEqual(true)
    })

    it('sets showHardStopWarning to false if the release date is outside of the window', () => {
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].showHardStopWarning
      ).toEqual(false)
    })

    it('sets showHardStopWarning to false if hardStopEnabled is false', () => {
      config.hardStopEnabled = false
      const releaseDate = parse(nomisRecord.releaseDate, 'yyyy-MM-dd', new Date())
      hardStopDates = { hardStopWarningDate: subDays(releaseDate, 1), hardStopCutoffDate: addDays(releaseDate, 1) }

      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].showHardStopWarning
      ).toEqual(false)
    })
  })

  describe('isClickable', () => {
    it('should be false if the PP is undefined', () => {
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner: undefined, licences: [licence] }],
          null,
          hardStopDates
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be false if the licence status is NOT_IN_PILOT', () => {
      licence = { ...licence, status: LicenceStatus.NOT_IN_PILOT }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be false if the licence is a recall', () => {
      licence = { ...licence, status: LicenceStatus.OOS_RECALL }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be false if the licence is a breach of supervision', () => {
      licence = { ...licence, status: LicenceStatus.OOS_BOTUS }
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].isClickable
      ).toEqual(false)
    })

    it('should be true in any other case', () => {
      expect(
        createCaseloadViewModel(
          [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
          null,
          hardStopDates
        )[0].isClickable
      ).toEqual(true)
    })
  })

  describe('search', () => {
    it('searches on CRN', () => {
      expect(createCaseloadViewModel(managedCases, 'A123456', hardStopDates)).toEqual([
        {
          name: 'Bob Smith',
          crnNumber: 'A123456',
          prisonerNumber: 'A1234BC',
          releaseDate: moment('2020-01-01').format('DD MMM YYYY'),
          licenceId: 1,
          licenceStatus: 'IN_PROGRESS',
          licenceType: 'AP',
          probationPractitioner,
          createLink: '/licence/create/id/1/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
        },
      ])
    })

    it('searches on name', () => {
      expect(createCaseloadViewModel(managedCases, 'john', hardStopDates)).toEqual([
        {
          name: 'John Johnson',
          crnNumber: 'B789012',
          prisonerNumber: 'D1234EF',
          releaseDate: moment('2020-01-01').format('DD MMM YYYY'),
          licenceId: 2,
          licenceStatus: 'APPROVED',
          licenceType: 'AP_PSS',
          probationPractitioner,
          createLink: '/licence/create/id/2/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
        },
      ])
    })

    it('searches on PP name', () => {
      expect(createCaseloadViewModel(managedCases, 'bond', hardStopDates)).toEqual([
        {
          name: 'Bob Smith',
          crnNumber: 'A123456',
          prisonerNumber: 'A1234BC',
          releaseDate: moment('2020-01-01').format('DD MMM YYYY'),
          licenceId: 1,
          licenceStatus: 'IN_PROGRESS',
          licenceType: 'AP',
          probationPractitioner,
          createLink: '/licence/create/id/1/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
        },
        {
          name: 'John Johnson',
          crnNumber: 'B789012',
          prisonerNumber: 'D1234EF',
          releaseDate: moment('2020-01-01').format('DD MMM YYYY'),
          licenceId: 2,
          licenceStatus: 'APPROVED',
          licenceType: 'AP_PSS',
          probationPractitioner,
          createLink: '/licence/create/id/2/check-your-answers',
          isClickable: true,
          showHardStopWarning: false,
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
    expect(createCaseloadViewModel(managedCases, 'bond', hardStopDates)).toEqual([
      {
        name: 'John Johnson',
        crnNumber: 'B789012',
        prisonerNumber: 'D1234EF',
        releaseDate: moment('2020-01-01').format('DD MMM YYYY'),
        licenceId: 2,
        licenceStatus: 'APPROVED',
        licenceType: 'AP_PSS',
        probationPractitioner,
        createLink: '/licence/create/id/2/check-your-answers',
        isClickable: true,
        showHardStopWarning: false,
      },
      {
        name: 'Bob Smith',
        crnNumber: 'A123456',
        prisonerNumber: 'A1234BC',
        releaseDate: moment('2020-02-02').format('DD MMM YYYY'),
        licenceId: 1,
        licenceStatus: 'IN_PROGRESS',
        licenceType: 'AP',
        probationPractitioner,
        createLink: '/licence/create/id/1/check-your-answers',
        isClickable: true,
        showHardStopWarning: false,
      },
    ])
  })

  describe('buildCreateLink', () => {
    it('returns not approved in time link if the licence is timed out and is an edit of an existing approved licence', () => {
      const licence1 = { ...licence, id: 2, status: LicenceStatus.TIMED_OUT, versionOf: 1 }
      const licence2 = { ...licence, id: 1, status: LicenceStatus.APPROVED }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence1, licence2] }],
        null,
        hardStopDates
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/2/licence-changes-not-approved-in-time')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns prison prison-will-create link if the licence is timed out and is not an edit', () => {
      licence = { ...licence, status: LicenceStatus.TIMED_OUT }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
        null,
        hardStopDates
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns the create licence link if the licence has not been started', () => {
      licence = { status: LicenceStatus.NOT_STARTED, type: LicenceType.AP }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
        null,
        hardStopDates
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/confirm')
      expect(licenceViewModel.licenceStatus).toEqual('NOT_STARTED')
    })

    it('returns prison-will-create link if the licence kind is HARD_STOP but is still IN_PROGRESS', () => {
      const licence1 = {
        ...licence,
        id: 2,
        kind: LicenceKind.HARD_STOP,
        status: LicenceStatus.IN_PROGRESS,
        versionOf: 1,
      }
      const licence2 = { ...licence, status: LicenceStatus.TIMED_OUT }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence1, licence2] }],
        null,
        hardStopDates
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/nomisId/A1234BC/prison-will-create-this-licence')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns created-by-prison link if the licence kind is HARD_STOP and the licence status is not IN_PROGRESS', () => {
      const licence1 = { ...licence, id: 2, kind: LicenceKind.HARD_STOP, status: LicenceStatus.SUBMITTED, versionOf: 1 }
      const licence2 = { ...licence, status: LicenceStatus.TIMED_OUT }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence1, licence2] }],
        null,
        hardStopDates
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/2/licence-created-by-prison')
      expect(licenceViewModel.licenceStatus).toEqual('TIMED_OUT')
    })

    it('returns check-your-answers link if the licence is in any other state', () => {
      licence = { ...licence }
      const licenceViewModel = createCaseloadViewModel(
        [{ nomisRecord, deliusRecord, probationPractitioner, licences: [licence] }],
        null,
        hardStopDates
      )[0]
      expect(licenceViewModel.createLink).toEqual('/licence/create/id/1/check-your-answers')
      expect(licenceViewModel.licenceStatus).toEqual('IN_PROGRESS')
    })
  })
})
