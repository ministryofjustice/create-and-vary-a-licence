import BespokeConditionsQuestionRoutes from './bespokeConditionsQuestion'
import { createRequestAndResponse, createUser } from '../../../testUtils/handlerTestUtils'

describe('Route Handlers - Create Licence - Bespoke Conditions Question', () => {
  const handler = new BespokeConditionsQuestionRoutes()

  describe('GET', () => {
    it('should render view', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1' },
        res: { user: createUser({ username: 'joebloggs' }) },
      })

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/bespokeConditionsQuestion')
    })
  })

  describe('POST', () => {
    it('should redirect to the bespoke conditions page when answer is YES', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1', body: { answer: 'Yes' } },
        res: { user: createUser({ username: 'joebloggs' }) },
      })

      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions')
    })

    it('should redirect to the check answers page when answer is NO and licence type is AP', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1', body: { answer: 'No' } },
        res: {
          user: createUser({ username: 'joebloggs' }),
          licence: { typeCode: 'AP' },
        },
      })

      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should redirect to the PSS conditions question page when answer is NO and licence type is PSS', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1', body: { answer: 'No' } },
        res: {
          user: createUser({ username: 'joebloggs' }),
          licence: { typeCode: 'PSS' },
        },
      })

      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions-question')
    })

    it('should redirect to the PSS conditions question page when answer is NO and licence type is AP_PSS', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1', body: { answer: 'No' } },
        res: {
          user: createUser({ username: 'joebloggs' }),
          licence: { typeCode: 'AP_PSS' },
        },
      })

      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions-question')
    })
  })
})
