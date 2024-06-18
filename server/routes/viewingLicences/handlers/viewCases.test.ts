import { Request, Response } from 'express'

import { addDays, startOfDay, subDays } from 'date-fns'
import { search } from 'superagent'
import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

import LicenceType from '../../../enumeration/licenceType'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import type { CvlFields, CvlPrisoner } from '../../../@types/licenceApiClientTypes'
import { CaViewCasesTab, parseCvlDate } from '../../../utils/utils'
import LicenceKind from '../../../enumeration/LicenceKind'
import CaCaseloadService, { CaCase, CaCaseLoad, Case } from '../../../services/lists/caCaseloadService'

const caseloadService = new CaCaseloadService(null, null, null) as jest.Mocked<CaCaseloadService>
jest.mock('../../../services/lists/caCaseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService, prisonerService)
  let req: Request
  let res: Response

  const cvlFields: CvlFields = {
    licenceType: LicenceType.AP,
    hardStopDate: '03/01/2023',
    hardStopWarningDate: '01/01/2023',
    isInHardStopPeriod: true,
    isDueForEarlyRelease: false,
    isDueToBeReleasedInTheNextTwoWorkingDays: false,
    isEligibleForEarlyRelease: false,
  }

  const exampleCase = {
    kind: LicenceKind.CRD,
    licenceId: 1,
    licenceVersionOf: undefined,
    name: 'Bob Smith',
    prisonerNumber: 'A1234AA',
    probationPractitioner: {
      name: 'Sherlock Holmes',
    },
    releaseDate: '01 May 2022',
    releaseDateLabel: 'Confirmed release date',
    licenceStatus: LicenceStatus.NOT_STARTED,
    tabType: 'releasesInNextTwoWorkingDays',
    nomisLegalStatus: 'SENTENCED',
    lastWorkedOnBy: 'Test Updater',
    isDueForEarlyRelease: false,
    isInHardStopPeriod: true,
  } as CaCase

  beforeEach(() => {
    req = {
      query: {
        search: '',
      },
      session: { caseloadsSelected: [] },
    } as unknown as Request

    res = {
      header: jest.fn(),
      send: jest.fn(),
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
          activeCaseload: 'BAI',
          prisonCaseload: ['BAI'],
        },
      },
    } as unknown as Response

    prisonerService.getPrisons.mockResolvedValue([
      {
        agencyId: 'BAI',
        description: 'Belmarsh (HMP)',
      },
      {
        agencyId: 'BXI',
        description: 'Brixton (HMP)',
      },
      {
        agencyId: 'MDI',
        description: 'Moorland (HMP)',
      },
      {
        agencyId: 'BMI',
        description: 'Birmingham (HMP)',
      },
    ] as PrisonDetail[])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const caCase = [
    {
      kind: LicenceKind.CRD,
      licenceId: 1,
      licenceVersionOf: undefined,
      name: 'Bob Smith',
      prisonerNumber: 'A1234AA',
      probationPractitioner: {
        name: 'Sherlock Holmes',
      },
      releaseDate: '01 May 2022',
      releaseDateLabel: 'Confirmed release date',
      licenceStatus: LicenceStatus.NOT_STARTED,
      tabType: 'releasesInNextTwoWorkingDays',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: false,
      isInHardStopPeriod: true,
    },
    {
      kind: LicenceKind.CRD,
      licenceId: 2,
      licenceVersionOf: undefined,
      name: 'Stephen Rowe',
      prisonerNumber: 'A1234AE',
      probationPractitioner: {
        name: 'Larry Johnson',
      },
      releaseDate: '10 Jun 2022',
      releaseDateLabel: 'Confirmed release date',
      licenceStatus: LicenceStatus.APPROVED,
      tabType: 'releasesInNextTwoWorkingDays',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: false,
      isInHardStopPeriod: true,
    },
    {
      kind: LicenceKind.CRD,
      licenceId: 3,
      licenceVersionOf: undefined,
      name: 'Harvey Smith',
      prisonerNumber: 'A1234AC',
      probationPractitioner: {
        name: 'Walter White',
      },
      releaseDate: '01 May 2022',
      releaseDateLabel: 'Confirmed release date',
      licenceStatus: LicenceStatus.IN_PROGRESS,
      tabType: 'releasesInNextTwoWorkingDays',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: false,
      isInHardStopPeriod: true,
    },
    {
      kind: LicenceKind.CRD,
      licenceId: 4,
      licenceVersionOf: undefined,
      name: 'Harold Lloyd',
      prisonerNumber: 'A1234AD',
      probationPractitioner: {
        name: 'Harry Goldman',
      },
      releaseDate: '01 May 2022',
      releaseDateLabel: 'CRD',
      licenceStatus: LicenceStatus.SUBMITTED,
      tabType: 'releasesInNextTwoWorkingDays',
      nomisLegalStatus: 'SENTENCED',
      lastWorkedOnBy: 'Test Updater',
      isDueForEarlyRelease: true,
      isInHardStopPeriod: true,
    },
  ] as CaCase[]
  const prisonCaseload = { cases: caCase, showAttentionNeededTab: false } as CaCaseLoad

  describe('GET', () => {
    const probationCaseLoad = [
      {
        licence: {
          id: 5,
          type: LicenceType.AP,
          status: LicenceStatus.ACTIVE,
          hardStopDate: startOfDay(subDays(new Date(), 1)),
          isDueToBeReleasedInTheNextTwoWorkingDays: true,
        },
        cvlFields,
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-07-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Sherlock Holmes',
        },
      },
      {
        licence: {
          id: 6,
          type: LicenceType.AP,
          status: LicenceStatus.VARIATION_IN_PROGRESS,
          hardStopDate: startOfDay(addDays(new Date(), 1)),
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        cvlFields,
        nomisRecord: {
          firstName: 'Joe',
          lastName: 'Bloggs',
          prisonerNumber: 'A1234AB',
          conditionalReleaseDate: '2022-06-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Thor',
        },
      },
      {
        licence: {
          id: 7,
          type: LicenceType.AP,
          status: LicenceStatus.VARIATION_SUBMITTED,
          hardStopDate: startOfDay(addDays(new Date(), 1)),
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        cvlFields,
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licence: {
          id: 8,
          type: LicenceType.AP,
          status: LicenceStatus.VARIATION_APPROVED,
          hardStopDate: startOfDay(addDays(new Date(), 1)),
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        cvlFields,
        nomisRecord: {
          firstName: 'Harold',
          lastName: 'Lloyd',
          prisonerNumber: 'A1234AD',
          conditionalReleaseDate: '2022-05-01',
          legalStatus: 'SENTENCED',
        } as CvlPrisoner,
        probationPractitioner: {
          name: 'Harry Goldman',
        },
      },
    ] as Case[]

    it('should render cases when user only has 1 caseloaded prison', async () => {
      caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
      res.locals.prisonCaseload = ['BAI']
      await handler.GET(req, res)

      expect(prisonerService.getPrisons).toHaveBeenCalled()

      expect(caseloadService.getPrisonView).toHaveBeenCalledWith(
        { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
        ['BAI'],
        ''
      )
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            link: null,
            licenceId: 1,
            licenceStatus: 'NOT_STARTED',
            licenceVersionOf: undefined,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            lastWorkedOnBy: 'Test Updater',
            isDueForEarlyRelease: false,
          },
          {
            link: '/licence/view/id/2/show',
            licenceId: 2,
            licenceStatus: 'APPROVED',
            name: 'Stephen Rowe',
            prisonerNumber: 'A1234AE',
            probationPractitioner: {
              name: 'Larry Johnson',
            },
            releaseDate: '10 Jun 2022',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
            licenceVersionOf: undefined,
            lastWorkedOnBy: 'Test Updater',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
          },
          {
            link: null,
            licenceId: 3,
            licenceStatus: 'IN_PROGRESS',
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'Confirmed release date',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: false,
            lastWorkedOnBy: 'Test Updater',
            licenceVersionOf: undefined,
          },
          {
            link: '/licence/view/id/4/show',
            licenceId: 4,
            licenceStatus: 'SUBMITTED',
            licenceVersionOf: undefined,
            name: 'Harold Lloyd',
            prisonerNumber: 'A1234AD',
            probationPractitioner: {
              name: 'Harry Goldman',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
            tabType: 'releasesInNextTwoWorkingDays',
            nomisLegalStatus: 'SENTENCED',
            isDueForEarlyRelease: true,
            lastWorkedOnBy: 'Test Updater',
          },
        ],
        CaViewCasesTab,
        showAttentionNeededTab: false,
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        probationView: false,
        search: '',
        statusConfig,
      })
    })

    // it('should render cases when user selects prison which is not their currently active prison', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   res.locals.user.prisonCaseload = ['BAI', 'MDI']
    //   req.session.caseloadsSelected = ['MDI']

    //   await handler.GET(req, res)

    //   expect(caseloadService.getPrisonView).toHaveBeenCalledWith(
    //     {
    //       activeCaseload: 'BAI',
    //       prisonCaseload: ['BAI', 'MDI'],
    //       username: 'joebloggs',
    //     },
    //     ['MDI'],
    //     ''
    //   )

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: 1,
    //         licenceStatus: 'NOT_STARTED',
    //         licenceVersionOf: undefined,
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         lastWorkedOnBy: 'Test Updater',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/2/show',
    //         licenceId: 2,
    //         licenceStatus: 'APPROVED',
    //         name: 'Stephen Rowe',
    //         prisonerNumber: 'A1234AE',
    //         probationPractitioner: {
    //           name: 'Larry Johnson',
    //         },
    //         releaseDate: '10 Jun 2022',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //         licenceVersionOf: undefined,
    //         lastWorkedOnBy: 'Test Updater',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //       },
    //       {
    //         link: null,
    //         licenceId: 3,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //         lastWorkedOnBy: 'Test Updater',
    //         licenceVersionOf: undefined,
    //       },
    //       {
    //         link: '/licence/view/id/4/show',
    //         licenceId: 4,
    //         licenceStatus: 'SUBMITTED',
    //         licenceVersionOf: undefined,
    //         name: 'Harold Lloyd',
    //         prisonerNumber: 'A1234AD',
    //         probationPractitioner: {
    //           name: 'Harry Goldman',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: true,
    //         lastWorkedOnBy: 'Test Updater',
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: true,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'MDI',
    //         description: 'Moorland (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: '',
    //     statusConfig,
    //   })
    // })

    // it('should render list of licences for multiple selected prisons', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   req.session.caseloadsSelected = ['MDI', 'BXI']
    //   res.locals.user.prisonCaseload = ['BAI', 'MDI', 'BXI']
    //   await handler.GET(req, res)

    //   expect(caseloadService.getPrisonView).toHaveBeenCalledWith(
    //     { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI', 'MDI', 'BXI'] },
    //     ['MDI', 'BXI'],
    //     ''
    //   )
    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 3,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/4/show',
    //         licenceId: 4,
    //         licenceStatus: 'SUBMITTED',
    //         name: 'Harold Lloyd',
    //         prisonerNumber: 'A1234AD',
    //         probationPractitioner: {
    //           name: 'Harry Goldman',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/2/show',
    //         licenceId: 2,
    //         licenceStatus: 'APPROVED',
    //         name: 'Stephen Rowe',
    //         prisonerNumber: 'A1234AE',
    //         probationPractitioner: {
    //           name: 'Larry Johnson',
    //         },
    //         releaseDate: '10 Jun 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: true,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BXI',
    //         description: 'Brixton (HMP)',
    //       },
    //       {
    //         agencyId: 'MDI',
    //         description: 'Moorland (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should render licences for for People In Prison in ascending order', async () => {
    //   const aCase = (prisonerNumber: string, releaseDate: string): CaCase => ({
    //     ...exampleCase,
    //     prisonerNumber,
    //     releaseDate,
    //   })

    //   caseloadService.getPrisonView.mockResolvedValue({
    //     cases: [
    //       aCase('A1234AD', '2022-05-01'),
    //       aCase('A1234AE', '2022-06-01'),
    //       aCase('A1234AB', '2022-04-01'),
    //       aCase('A1234AC', '2022-04-05'),
    //       aCase('A1234AA', '2022-01-09'),
    //     ],
    //     showAttentionNeededTab: false,
    //   })

    //   req.session.caseloadsSelected = ['MDI']
    //   res.locals.user.prisonCaseload = ['MDI']
    //   await handler.GET(req, res)

    //   expect(res.render).toContain(
    //     expect.objectContaining({
    //       cases: [
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AA',
    //           releaseDate: '09 Jan 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AB',
    //           releaseDate: '01 Apr 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AC',
    //           releaseDate: '05 Apr 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AD',
    //           releaseDate: '01 May 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AE',
    //           releaseDate: '01 Jun 2022',
    //         }),
    //       ],
    //     })
    //   )
    // })

    // it('should render licences for for People On Probation in descending order', async () => {
    //   req.query.view = 'probation'

    //   const aCase = (prisonerNumber: string, confirmedReleaseDate: string, conditionalReleaseDate: string): Case => ({
    //     ...exampleCase,
    //     licence: { ...exampleCase.licence, status: LicenceStatus.ACTIVE },
    //     nomisRecord: { ...exampleCase.nomisRecord, prisonerNumber, conditionalReleaseDate, confirmedReleaseDate },
    //   })

    //   caseloadService.getProbationView.mockResolvedValue([
    //     aCase('A1234AD', '2022-05-01', '2022-01-03'),
    //     aCase('A1234AE', '2022-06-01', '2022-05-03'),
    //     aCase('A1234AB', '2022-04-01', '2022-06-03'),
    //     aCase('A1234AC', '2022-04-05', '2022-05-03'),
    //     aCase('A1234AA', undefined, '2022-01-09'),
    //   ])

    //   req.session.caseloadsSelected = ['MDI']
    //   res.locals.user.prisonCaseload = ['MDI']
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith(
    //     'pages/view/cases',
    //     expect.objectContaining({
    //       cases: [
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AE',
    //           releaseDate: '01 Jun 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AD',
    //           releaseDate: '01 May 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AC',
    //           releaseDate: '05 Apr 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AB',
    //           releaseDate: '01 Apr 2022',
    //         }),
    //         expect.objectContaining({
    //           prisonerNumber: 'A1234AA',
    //           releaseDate: '09 Jan 2022',
    //         }),
    //       ],
    //       probationView: true,
    //     })
    //   )
    // })

    // it('should successfully search by name', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   req.query.search = 'bob'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: 'bob',
    //     statusConfig,
    //   })
    // })

    // it('should successfully search by prison number', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   req.query.search = 'A1234AA'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         licenceId: undefined,
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         licenceStatus: LicenceStatus.NOT_STARTED,
    //         link: null,
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: 'A1234AA',
    //     statusConfig,
    //   })
    // })

    // it('should successfully search by probation practitioner', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   req.query.search = 'holmes'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: 'holmes',
    //     statusConfig,
    //   })
    // })

    // it('should evaluate the links of cases for probation view', async () => {
    //   caseloadService.getProbationView.mockResolvedValue(probationCaseLoad)
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'probation'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: '/licence/view/id/5/show',
    //         licenceId: 5,
    //         licenceStatus: 'ACTIVE',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 Jul 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 6,
    //         licenceStatus: 'VARIATION_IN_PROGRESS',
    //         name: 'Joe Bloggs',
    //         prisonerNumber: 'A1234AB',
    //         probationPractitioner: {
    //           name: 'Thor',
    //         },
    //         releaseDate: '01 Jun 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 7,
    //         licenceStatus: 'VARIATION_SUBMITTED',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 8,
    //         licenceStatus: 'VARIATION_APPROVED',
    //         name: 'Harold Lloyd',
    //         prisonerNumber: 'A1234AD',
    //         probationPractitioner: {
    //           name: 'Harry Goldman',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: true,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should evaluate the links of cases for prison view', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 3,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/4/show',
    //         licenceId: 4,
    //         licenceStatus: 'SUBMITTED',
    //         name: 'Harold Lloyd',
    //         prisonerNumber: 'A1234AD',
    //         probationPractitioner: {
    //           name: 'Harry Goldman',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/2/show',
    //         licenceId: 2,
    //         licenceStatus: 'APPROVED',
    //         name: 'Stephen Rowe',
    //         prisonerNumber: 'A1234AE',
    //         probationPractitioner: {
    //           name: 'Larry Johnson',
    //         },
    //         releaseDate: '10 Jun 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should allow creation of hardstop licence during hardstop and should override the TIMED_OUT status to NOT_STARTED', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue([
    //     { ...exampleCase, licence: { ...exampleCase.licence, status: LicenceStatus.TIMED_OUT } },
    //   ])
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         link: '/licence/hard-stop/create/nomisId/A1234AA/confirm',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should allow creation of hardstop licence for existing TIMED_OUT licences', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue([
    //     { ...exampleCase, licence: { ...exampleCase.licence, id: 4, status: LicenceStatus.TIMED_OUT } },
    //   ])
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         licenceId: 4,
    //         licenceStatus: 'NOT_STARTED',
    //         link: '/licence/hard-stop/create/nomisId/A1234AA/confirm',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should allow modifying inprogress hardstop licence during hardstop', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue([
    //     {
    //       ...exampleCase,
    //       licence: { ...exampleCase.licence, id: 3, kind: LicenceKind.HARD_STOP, status: LicenceStatus.IN_PROGRESS },
    //     },
    //   ])
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         licenceId: 3,
    //         licenceStatus: 'IN_PROGRESS',
    //         link: '/licence/hard-stop/id/3/check-your-answers',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should evaluate the links of cases for prison view in hardstop', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue([
    //     ...prisonCaseload,
    //     { ...exampleCase, licence: { ...exampleCase.licence, status: LicenceStatus.TIMED_OUT } },
    //   ])
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 3,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/4/show',
    //         licenceId: 4,
    //         licenceStatus: 'SUBMITTED',
    //         name: 'Harold Lloyd',
    //         prisonerNumber: 'A1234AD',
    //         probationPractitioner: {
    //           name: 'Harry Goldman',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         link: '/licence/hard-stop/create/nomisId/A1234AA/confirm',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/2/show',
    //         licenceId: 2,
    //         licenceStatus: 'APPROVED',
    //         name: 'Stephen Rowe',
    //         prisonerNumber: 'A1234AE',
    //         probationPractitioner: {
    //           name: 'Larry Johnson',
    //         },
    //         releaseDate: '10 Jun 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should render in progress licence if an offender has an approved and in progress version', async () => {
    //   const multipleLicencesCaseList = [
    //     {
    //       licence: {
    //         id: 67,
    //         type: LicenceType.AP,
    //         status: LicenceStatus.IN_PROGRESS,
    //         versionOf: 45,
    //         hardStopDate: parseCvlDate('12/01/2024'),
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         releaseDate: null as Date,
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Bob',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AA',
    //         confirmedReleaseDate: '2022-05-01',
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Sherlock Holmes',
    //       },
    //     },
    //   ]
    //   caseloadService.getPrisonView.mockResolvedValue(multipleLicencesCaseList)
    //   res.locals.prisonCaseload = ['BAI']
    //   await handler.GET(req, res)

    //   expect(prisonerService.getPrisons).toHaveBeenCalled()

    //   expect(caseloadService.getPrisonView).toHaveBeenCalledWith(
    //     { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
    //     ['BAI']
    //   )
    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: 67,
    //         licenceVersionOf: 45,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should evaluate the tabType of cases', async () => {
    //   caseloadService.getPrisonView.mockResolvedValue(prisonCaseload)
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: 3,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/4/show',
    //         licenceId: 4,
    //         licenceStatus: 'SUBMITTED',
    //         name: 'Harold Lloyd',
    //         prisonerNumber: 'A1234AD',
    //         probationPractitioner: {
    //           name: 'Harry Goldman',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: '/licence/view/id/2/show',
    //         licenceId: 2,
    //         licenceStatus: 'APPROVED',
    //         name: 'Stephen Rowe',
    //         prisonerNumber: 'A1234AE',
    //         probationPractitioner: {
    //           name: 'Larry Johnson',
    //         },
    //         releaseDate: '10 Jun 2022',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'futureReleases',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should return tab type as attentionNeeded if release date is null on search but present on licences', async () => {
    //   const caseLoadWithReleaseDate = [
    //     {
    //       licence: {
    //         type: LicenceType.AP,
    //         status: LicenceStatus.APPROVED,
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         releaseDate: parseCvlDate('01/02/2024'),
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Bob',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AA',
    //         confirmedReleaseDate: '',
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Sherlock Holmes',
    //       },
    //     },
    //   ]
    //   caseloadService.getPrisonView.mockResolvedValue(caseLoadWithReleaseDate)
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'APPROVED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 Feb 2024',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should not return tab type as attentionNeeded if release date is null', async () => {
    //   const caseLoadWithEmptyReleaseDate = [
    //     {
    //       licence: {
    //         type: LicenceType.AP,
    //         status: LicenceStatus.APPROVED,
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         releaseDate: null as Date,
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Bob',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AA',
    //         confirmedReleaseDate: '',
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Sherlock Holmes',
    //       },
    //     },
    //     {
    //       licence: {
    //         type: LicenceType.AP,
    //         status: LicenceStatus.IN_PROGRESS,
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         releaseDate: null as Date,
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Harvey',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AC',
    //         conditionalReleaseDate: null,
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Walter White',
    //       },
    //     },
    //   ]
    //   caseloadService.getPrisonView.mockResolvedValue(caseLoadWithEmptyReleaseDate)
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'APPROVED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: 'not found',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'attentionNeeded',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //       {
    //         link: null,
    //         licenceId: undefined,
    //         licenceStatus: 'IN_PROGRESS',
    //         name: 'Harvey Smith',
    //         prisonerNumber: 'A1234AC',
    //         probationPractitioner: {
    //           name: 'Walter White',
    //         },
    //         releaseDate: 'not found',
    //         releaseDateLabel: 'CRD',
    //         tabType: 'attentionNeeded',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: true,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // it('should return showAttentionNeededTab true even if search results has no attention needed cases', async () => {
    //   req.query.search = 'A12345AA'
    //   const caseLoadWithEmptyReleaseDate = [
    //     {
    //       licence: {
    //         type: LicenceType.AP,
    //         status: LicenceStatus.APPROVED,
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         releaseDate: null,
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Bob',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AA',
    //         confirmedReleaseDate: '',
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Sherlock Holmes',
    //       },
    //     },
    //     {
    //       licence: {
    //         type: LicenceType.AP,
    //         status: LicenceStatus.IN_PROGRESS,
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         releaseDate: null,
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Harvey',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AC',
    //         conditionalReleaseDate: null,
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Walter White',
    //       },
    //     },
    //   ] as Case[]
    //   caseloadService.getPrisonView.mockResolvedValue(caseLoadWithEmptyReleaseDate)
    //   res.locals.user.prisonCaseload = ['BAI']
    //   req.query.view = 'prison'
    //   await handler.GET(req, res)

    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: true,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: 'A12345AA',
    //     statusConfig,
    //   })
    // })

    // it('should render last worked on by correctly', async () => {
    //   const cases = [
    //     {
    //       licence: {
    //         id: 1,
    //         type: LicenceType.AP,
    //         status: LicenceStatus.NOT_STARTED,
    //         hardStopDate: startOfDay(subDays(new Date(), 1)),
    //         isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //         updatedByFullName: 'Test Updater',
    //         releaseDate: null as Date,
    //       },
    //       cvlFields,
    //       nomisRecord: {
    //         firstName: 'Bob',
    //         lastName: 'Smith',
    //         prisonerNumber: 'A1234AA',
    //         confirmedReleaseDate: '2022-05-01',
    //         legalStatus: 'SENTENCED',
    //       } as CvlPrisoner,
    //       probationPractitioner: {
    //         name: 'Sherlock Holmes',
    //       },
    //     },
    //   ]
    //   caseloadService.getPrisonView.mockResolvedValue(cases)
    //   res.locals.prisonCaseload = ['BAI']
    //   await handler.GET(req, res)

    //   expect(prisonerService.getPrisons).toHaveBeenCalled()

    //   expect(caseloadService.getPrisonView).toHaveBeenCalledWith(
    //     { username: 'joebloggs', activeCaseload: 'BAI', prisonCaseload: ['BAI'] },
    //     ['BAI']
    //   )
    //   expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //     cases: [
    //       {
    //         link: null,
    //         licenceId: 1,
    //         licenceStatus: 'NOT_STARTED',
    //         name: 'Bob Smith',
    //         prisonerNumber: 'A1234AA',
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //         releaseDate: '01 May 2022',
    //         releaseDateLabel: 'Confirmed release date',
    //         tabType: 'releasesInNextTwoWorkingDays',
    //         nomisLegalStatus: 'SENTENCED',
    //         isDueForEarlyRelease: false,
    //         lastWorkedOnBy: 'Test Updater',
    //       },
    //     ],
    //     CaViewCasesTab,
    //     showAttentionNeededTab: false,
    //     hasMultipleCaseloadsInNomis: false,
    //     prisonsToDisplay: [
    //       {
    //         agencyId: 'BAI',
    //         description: 'Belmarsh (HMP)',
    //       },
    //     ],
    //     probationView: false,
    //     search: undefined,
    //     statusConfig,
    //   })
    // })

    // describe('findLatestLicence with TIMED_OUT licence', () => {
    //   it('should return a hard stop licence', async () => {
    //     const caseList = [
    //       {
    //         licence: {
    //           id: 2,
    //           type: LicenceType.AP,
    //           status: LicenceStatus.APPROVED,
    //           hardStopDate: startOfDay(subDays(new Date(), 1)),
    //           kind: LicenceKind.HARD_STOP,
    //           isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //           releaseDate: null as Date,
    //         },
    //         cvlFields,
    //         nomisRecord: {
    //           firstName: 'Bob',
    //           lastName: 'Smith',
    //           prisonerNumber: 'A1234AA',
    //           confirmedReleaseDate: '2022-05-01',
    //           legalStatus: 'SENTENCED',
    //         } as CvlPrisoner,
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //       },
    //     ]

    //     caseloadService.getPrisonView.mockResolvedValue(caseList)

    //     await handler.GET(req, res)

    //     expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //       cases: [
    //         {
    //           link: '/licence/view/id/2/show',
    //           licenceId: 2,
    //           licenceStatus: 'APPROVED',
    //           name: 'Bob Smith',
    //           prisonerNumber: 'A1234AA',
    //           probationPractitioner: {
    //             name: 'Sherlock Holmes',
    //           },
    //           releaseDate: '01 May 2022',
    //           releaseDateLabel: 'Confirmed release date',
    //           tabType: 'releasesInNextTwoWorkingDays',
    //           nomisLegalStatus: 'SENTENCED',
    //           isDueForEarlyRelease: false,
    //         },
    //       ],
    //       CaViewCasesTab,
    //       showAttentionNeededTab: false,
    //       hasMultipleCaseloadsInNomis: false,
    //       prisonsToDisplay: [
    //         {
    //           agencyId: 'BAI',
    //           description: 'Belmarsh (HMP)',
    //         },
    //       ],
    //       probationView: false,
    //       search: undefined,
    //       statusConfig,
    //     })
    //   })

    //   it('should return a previously approved licence', async () => {
    //     const caseList = [
    //       {
    //         licence: {
    //           id: 1,
    //           type: LicenceType.AP,
    //           status: LicenceStatus.APPROVED,
    //           hardStopDate: startOfDay(subDays(new Date(), 1)),
    //           kind: LicenceKind.HARD_STOP,
    //           isDueToBeReleasedInTheNextTwoWorkingDays: true,
    //           releaseDate: null as Date,
    //         },
    //         cvlFields,
    //         nomisRecord: {
    //           firstName: 'Bob',
    //           lastName: 'Smith',
    //           prisonerNumber: 'A1234AA',
    //           confirmedReleaseDate: '2022-05-01',
    //           legalStatus: 'SENTENCED',
    //         } as CvlPrisoner,
    //         probationPractitioner: {
    //           name: 'Sherlock Holmes',
    //         },
    //       },
    //     ]

    //     caseloadService.getPrisonView.mockResolvedValue(caseList)

    //     await handler.GET(req, res)

    //     expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
    //       cases: [
    //         {
    //           link: '/licence/view/id/1/show',
    //           licenceId: 1,
    //           licenceStatus: 'APPROVED',
    //           name: 'Bob Smith',
    //           prisonerNumber: 'A1234AA',
    //           probationPractitioner: {
    //             name: 'Sherlock Holmes',
    //           },
    //           releaseDate: '01 May 2022',
    //           releaseDateLabel: 'Confirmed release date',
    //           tabType: 'releasesInNextTwoWorkingDays',
    //           nomisLegalStatus: 'SENTENCED',
    //           isDueForEarlyRelease: false,
    //         },
    //       ],
    //       CaViewCasesTab,
    //       showAttentionNeededTab: false,
    //       hasMultipleCaseloadsInNomis: false,
    //       prisonsToDisplay: [
    //         {
    //           agencyId: 'BAI',
    //           description: 'Belmarsh (HMP)',
    //         },
    //       ],
    //       probationView: false,
    //       search: undefined,
    //       statusConfig,
    //     })
    //   })
    // })
  })
})
