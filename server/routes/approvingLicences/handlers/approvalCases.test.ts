import { Request, Response } from 'express'

import ApprovalCaseRoutes from './approvalCases'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'

import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import LicenceService from '../../../services/licenceService'
import { Licence } from '../../../@types/licenceApiClientTypes'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
jest.mock('../../../services/prisonerService')

const licenceService = new LicenceService(null, prisonerService, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Approval - case list', () => {
  const handler = new ApprovalCaseRoutes(caseloadService, prisonerService, licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      query: {},
      session: { caseloadsSelected: [] },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
          activeCaseload: 'BAI',
          prisonCaseload: ['BAI'],
        },
      },
    } as unknown as Response

    caseloadService.getApproverCaseload.mockResolvedValue([
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.SUBMITTED,
          },
        ],
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          confirmedReleaseDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licences: [
          {
            id: 2,
            type: LicenceType.AP,
            status: LicenceStatus.NOT_STARTED,
          },
        ],
        nomisRecord: {
          firstName: 'Joe',
          lastName: 'Bloggs',
          prisonerNumber: 'A1234AB',
          conditionalReleaseOverrideDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Thor',
        },
      },
      {
        licences: [
          {
            id: 3,
            type: LicenceType.AP,
            status: LicenceStatus.NOT_IN_PILOT,
          },
        ],
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Walter Black',
        },
      },
    ])

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

    licenceService.getLicence.mockResolvedValue({
      id: 1,
      typeCode: 'AP',
      additionalLicenceConditions: [],
      additionalPssConditions: [],
      bespokeConditions: [],
      isVariation: false,
      conditionalReleaseDate: '5/1/2022',
      actualReleaseDate: '3/1/2022',
    }) as unknown as Licence
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render list of licences for approval', async () => {
      await handler.GET(req, res)
      expect(caseloadService.getApproverCaseload).toHaveBeenCalledWith(res.locals.user, ['BAI'])
      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
          {
            licenceId: 2,
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
          {
            licenceId: 3,
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter Black',
            },
            releaseDate: '01 May 2022',
            releaseDateLabel: 'CRD',
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: undefined,
      })
    })

    it('should successfully search by name', async () => {
      req.query.search = 'bob'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'bob',
      })
    })

    it('should successfully search by prison number', async () => {
      req.query.search = 'A1234AA'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'A1234AA',
      })
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.search = 'white'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '03 Jan 2022',
            releaseDateLabel: 'Confirmed release date',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'white',
      })
    })

    it('should return empty caseload if search does not match', async () => {
      req.query.search = 'XXX'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [],
        hasMultipleCaseloadsInNomis: false,
        prisonsToDisplay: [
          {
            agencyId: 'BAI',
            description: 'Belmarsh (HMP)',
          },
        ],
        search: 'XXX',
      })
    })
  })
})
