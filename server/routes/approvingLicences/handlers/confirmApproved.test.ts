import { Request, Response } from 'express'

import ConfirmApprovedRoutes from './confirmApproved'

describe('Route - approve licence', () => {
  const handler = new ConfirmApprovedRoutes()
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
          typeCode: 'PSS',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render confirmation page for AP', async () => {
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage: 'A case administrator can now print the licence for Joe Bloggs.',
      })
    })

    it('should render confirmation page for AP_PSS', async () => {
      res.locals.licence.typeCode = 'AP_PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence and post sentence supervision order approved',
        confirmationMessage:
          'A case administrator can now print the licence and post sentence supervision order for Joe Bloggs.',
      })
    })

    it('should render confirmation page for PSS', async () => {
      res.locals.licence.typeCode = 'PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Post sentence supervision order approved',
        confirmationMessage: 'A case administrator can now print the post sentence supervision order for Joe Bloggs.',
      })
    })
  })
})
