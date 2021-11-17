import { Request, Response } from 'express'

import ConfirmationRoutes from './confirmation'

describe('Route Handlers - Create Licence - Confirmation', () => {
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
          forename: 'Bobby',
          surname: 'Zamora',
          prisonDescription: `Leeds (HMP)`,
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view for AP_PSS licence type', async () => {
      res.locals.licence.typeCode = 'AP_PSS'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
        confirmationMessage:
          'We have sent the licence and post sentence supervision order to Leeds (HMP) for approval.',
        titleText: 'Licence and post sentence supervision order for Bobby Zamora sent',
      })
    })

    it('should render view for AP licence type', async () => {
      res.locals.licence.typeCode = 'AP'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
        confirmationMessage: 'We have sent the licence to Leeds (HMP) for approval.',
        titleText: 'Licence conditions for Bobby Zamora sent',
      })
    })

    it('should render view for PSS licence type', async () => {
      res.locals.licence.typeCode = 'PSS'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
        confirmationMessage: 'We have sent the post sentence supervision order to Leeds (HMP) for approval.',
        titleText: 'Post sentence supervision order for Bobby Zamora sent',
      })
    })
  })
})
