/* eslint-disable  @typescript-eslint/no-explicit-any */
import AdditionalConditionsQuestionRoutes from './additionalConditionsQuestion'

describe('Route Handlers - Create Licence - Additional Conditions Question', () => {
  const handler = new AdditionalConditionsQuestionRoutes()
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
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalConditionsQuestion', {
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
          'additional-conditions-required': 'yes',
        },
      }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-conditions')
    })

    it('should redirect to the expected page when answer is NO', async () => {
      req = {
        ...req,
        body: {
          'additional-conditions-required': 'no',
        },
      }
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions-question')
    })
  })
})
