/* eslint-disable  @typescript-eslint/no-explicit-any */
import BespokeConditionsQuestionRoutes from './bespokeConditionsQuestion'

describe('Route Handlers - Create Licence - Bespoke Conditions Question', () => {
  const handler = new BespokeConditionsQuestionRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/create/bespokeConditionsQuestion', {
        offender: {
          name: 'Adam Balasaravika',
        },
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the expected page when answer is YES', async () => {
      req = {
        ...req,
        body: {
          'bespoke-conditions-required': 'yes',
        },
      }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions')
    })

    it('should redirect to the expected page when answer is NO', async () => {
      req = {
        ...req,
        body: {
          'bespoke-conditions-required': 'no',
        },
      }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
