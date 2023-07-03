import { Request, Response } from 'express'

import ConfirmationRoutes from './confirmation'

describe('Route Handlers - Vary Licence - Confirmation', () => {
  const handler = new ConfirmationRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      session: {
        returnToCase: '/licence/vary/caseload',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        licence: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view for AP_PSS licence type', async () => {
      res.locals.licence.typeCode = 'AP_PSS'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
        licenceType: 'licence and post sentence supervision order',
        titleText: 'Licence conditions variation for Joe Bloggs sent',
        backLink: req.session.returnToCase,
      })
    })

    it('should render default backlink if no session state', async () => {
      const reqWithEmptySession = {
        params: {
          licenceId: '1',
        },
        body: { answer: 'Yes' },
        session: {},
        flash: jest.fn(),
      } as unknown as Request

      res.locals.licence.typeCode = 'AP_PSS'

      await handler.GET(reqWithEmptySession, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
        licenceType: 'licence and post sentence supervision order',
        titleText: 'Variation for Joe Bloggs sent',
        backLink: '/licence/vary/caseload',
      })
    })

    it('should render view for AP licence type', async () => {
      res.locals.licence.typeCode = 'AP'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
        licenceType: 'licence',
        titleText: 'Licence variation for Joe Bloggs sent',
        backLink: req.session.returnToCase,
      })
    })

    it('should render view for PSS licence type', async () => {
      res.locals.licence.typeCode = 'PSS'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
        licenceType: 'post sentence supervision order',
        titleText: 'Post sentence supervision order variation for Joe Bloggs sent',
        backLink: req.session.returnToCase,
      })
    })
  })
})
