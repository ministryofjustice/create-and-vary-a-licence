import { Request, Response } from 'express'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceChangesNotApprovedInTimeRoutes from './licenceChangesNotApprovedInTime'
import LicenceService from '../../../services/licenceService'
import ConditionService from '../../../services/conditionService'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
jest.mock('../../../services/licenceService')
jest.mock('../../../services/conditionService')

describe('Route Handlers - Create Licence - Licence changes not approved in time', () => {
  let req: Request
  let res: Response
  const handler = new LicenceChangesNotApprovedInTimeRoutes(licenceService, conditionService)
  const licence = {
    id: 1,
    surname: 'Bobson',
    forename: 'Bob',
    appointmentTime: '12/12/2022 14:16',
    prisonCode: 'MDI',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
  } as Licence

  beforeEach(() => {
    req = {
      params: {
        licenceId: licence.id,
      },
      session: {
        returnToCase: 'some-back-link',
      },
    } as unknown as Request
    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence,
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    beforeEach(() => {
      licenceService.getOmuEmail.mockResolvedValue({
        id: 1,
        prisonCode: 'MDI',
        email: 'moorland@prison.gov.uk',
        dateCreated: '2023-12-12T10:21:48.860Z',
        dateLastUpdated: '2023-12-12T10:21:48.860Z',
      })
      conditionService.getAdditionalAPConditionsForSummaryAndPdf.mockResolvedValue(
        res.locals.licence.additionalLicenceConditions
      )
    })

    it('should render view', async () => {
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/licenceChangesNotApprovedInTime', {
        licence,
        omuEmail: 'moorland@prison.gov.uk',
        additionalConditions: [],
        backLink: req.session.returnToCase,
      })
    })

    it('should render default return to caseload link if no session state', async () => {
      const reqWithEmptySession = {
        params: {
          licenceId: licence.id,
        },
        session: {},
      } as unknown as Request

      await handler.GET(reqWithEmptySession, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/licenceChangesNotApprovedInTime', {
        licence,
        additionalConditions: [],
        omuEmail: 'moorland@prison.gov.uk',
        backLink: '/licence/create/caseload',
      })
    })
  })
})
