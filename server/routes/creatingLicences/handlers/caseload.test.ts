import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Adam Balasaravika',
            crnNumber: 'X381306',
            conditionalReleaseDate: '03 August 2022',
          },
        ],
      })
    })
  })
})
