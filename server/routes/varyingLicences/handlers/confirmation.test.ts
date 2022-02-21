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
        titleText: 'Licence and post sentence supervision order variation for Joe Bloggs sent',
      })
    })

    it('should render view for AP licence type', async () => {
      res.locals.licence.typeCode = 'AP'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
        titleText: 'Licence variation for Joe Bloggs sent',
      })
    })

    it('should render view for PSS licence type', async () => {
      res.locals.licence.typeCode = 'PSS'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmation', {
        titleText: 'Post sentence supervision order variation for Joe Bloggs sent',
      })
    })
  })
})
