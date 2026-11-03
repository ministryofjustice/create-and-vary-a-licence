import { Request, Response } from 'express'
import { Licence } from '../../../@types/licenceApiClientTypes'
import LicenceService from '../../../services/licenceService'
import PostponedInterruptHandler from './postponedInterruptHandler'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Create Licence - Postponed interrupt', () => {
  const handler = new PostponedInterruptHandler(licenceService)
  const licence = {
    prisonCode: 'MDI',
  } as Licence
  const user = {
    username: 'joebloggs',
  }
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '123',
      },
      session: {
        returnToCase: '/licence/create/caseload?search=Smith',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        licence,
        user,
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render the postponed interrupt view with the return and continue links', async () => {
      licenceService.getOmuEmail.mockResolvedValue({
        prisonCode: 'MDI',
        email: 'omu@prison.gov.uk',
        dateCreated: '2023-12-12T10:21:48.860Z',
      })

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/postponedInterrupt', {
        backLink: '/licence/create/caseload?search=Smith',
        toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
        omuContact: 'omu@prison.gov.uk',
      })
      expect(licenceService.getOmuEmail).toHaveBeenCalledWith('MDI', user)
    })

    it('should use the caseload as the return link when there is no return case in the session', async () => {
      req.session = {} as Request['session']
      licenceService.getOmuEmail.mockResolvedValue({
        prisonCode: 'MDI',
        email: 'omu@prison.gov.uk',
        dateCreated: '2023-12-12T10:21:48.860Z',
      })

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/postponedInterrupt', {
        backLink: '/licence/create/caseload',
        toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
        omuContact: 'omu@prison.gov.uk',
      })
    })
  })
})
