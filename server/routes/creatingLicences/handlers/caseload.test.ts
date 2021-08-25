/* eslint-disable  @typescript-eslint/no-explicit-any */
import CaseloadRoutes from './caseload'

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes()
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      params: {
        id: 1,
      },
    }

    res = {
      render: jest.fn(),
    }
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
