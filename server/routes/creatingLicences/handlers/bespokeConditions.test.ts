/* eslint-disable  @typescript-eslint/no-explicit-any */
import BespokeConditionsRoutes from './bespokeConditions'

describe('Route Handlers - Create Licence - Bespoke Conditions', () => {
  const handler = new BespokeConditionsRoutes()
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
      redirect: jest.fn(),
    }
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/bespokeConditions', {
        offender: {
          name: 'Adam Balasaravika',
        },
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the expected page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
