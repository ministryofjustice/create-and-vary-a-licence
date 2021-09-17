import { Request, Response } from 'express'

import HomeRoutes from './home'
import * as utils from '../../../utils/utils'

jest.spyOn(utils, 'hasRole').mockReturnValue(true)

describe('Route Handlers - Home', () => {
  const handler = new HomeRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {} as Request

    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: true,
        shouldShowApproveLicenceCard: true,
        shouldShowMyCaseloadCard: true,
      })
    })
  })
})
