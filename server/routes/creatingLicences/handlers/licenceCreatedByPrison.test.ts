import { Request, Response } from 'express'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceCreatedByPrisonRoutes from './licenceCreatedByPrison'
import LicenceService from '../../../services/licenceService'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Create Licence - Licence created by prison', () => {
  let req: Request
  let res: Response
  const handler = new LicenceCreatedByPrisonRoutes(licenceService)
  const licence = {
    id: 1,
    surname: 'Bobson',
    forename: 'Bob',
    appointmentTime: '12/12/2022 14:16',
    prisonCode: 'MDI',
  } as Licence

  afterEach(() => {
    jest.resetAllMocks()
  })

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

  describe('GET', () => {
    beforeEach(() => {
      licenceService.getOmuEmail.mockResolvedValue({
        id: 1,
        prisonCode: 'MDI',
        email: 'moorland@prison.gov.uk',
        dateCreated: '2023-12-12T10:21:48.860Z',
        dateLastUpdated: '2023-12-12T10:21:48.860Z',
      })
    })

    it('should render view', async () => {
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/licenceCreatedByPrison', {
        licence,
        omuEmail: 'moorland@prison.gov.uk',
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
      expect(res.render).toHaveBeenCalledWith('pages/create/licenceCreatedByPrison', {
        licence,
        omuEmail: 'moorland@prison.gov.uk',
        backLink: '/licence/create/caseload',
      })
    })
  })
})
