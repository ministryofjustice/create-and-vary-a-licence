import { Request, Response } from 'express'

import OptOutInterruptHandler from './optOutInterruptHandler'

describe('Route Handlers - Create Licence - Opt out interrupt', () => {
  const handler = new OptOutInterruptHandler()
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
        licence: {},
        user: {},
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render the opt out interrupt view with the return and continue links', async () => {
      // Given
      // When
      await handler.GET(req, res)

      // Then the page is rendered with the expected links
      expect(res.render).toHaveBeenCalledWith('pages/create/optOutInterrupt', {
        backLink: '/licence/create/caseload?search=Smith',
        toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
      })
    })

    it('should use the caseload as the return link when there is no return case in the session', async () => {
      // Given
      req.session = {} as Request['session']

      // When
      await handler.GET(req, res)

      // Then
      expect(res.render).toHaveBeenCalledWith('pages/create/optOutInterrupt', {
        backLink: '/licence/create/caseload',
        toCheckYourAnswer: '/licence/create/id/123/check-your-answers',
      })
    })
  })
})
