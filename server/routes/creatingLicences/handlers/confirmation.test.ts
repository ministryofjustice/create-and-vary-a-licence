/* eslint-disable  @typescript-eslint/no-explicit-any */
import ConfirmationRoutes from './confirmation'

describe('Route Handlers - Create Licence - Confirmation', () => {
  const handler = new ConfirmationRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/create/confirmation', {
        offender: {
          name: 'Adam Balasaravika',
          prison: 'Brixton Prison',
        },
      })
    })
  })
})
