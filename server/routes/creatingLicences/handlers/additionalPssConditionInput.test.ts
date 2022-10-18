import { Request, Response } from 'express'
import ConditionService from '../../../services/conditionService'

import LicenceService from '../../../services/licenceService'
import AdditionalPssConditionInputRoutes from './additionalPssConditionInput'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, null, null, conditionService) as jest.Mocked<LicenceService>
const conditionsProviderSpy = jest.spyOn(conditionService, 'getAdditionalConditionByCode')

describe('Route Handlers - Create Licence - Additional Licence Condition Input', () => {
  const handler = new AdditionalPssConditionInputRoutes(licenceService, conditionService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        conditionId: '1',
      },
      query: {},
      body: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          additionalPssConditions: [],
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view with the additional condition and its config', async () => {
      conditionsProviderSpy.mockReturnValue(Promise.resolve({
        text: 'Condition 1',
        code: 'code1',
        inputs: [],
      }))

      res.locals.licence = {
        additionalPssConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      }

      await handler.GET(req, res)
      expect(conditionsProviderSpy).toHaveBeenCalledWith('code1')
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalPssConditionInput', {
        additionalCondition: {
          id: 1,
          code: 'code1',
          
        },
        config: {
          code: 'code1',
          inputs: [],
          text: 'Condition 1',
        },
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditionData = jest.fn()
      res.locals.licence = {
        additionalPssConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      }
    })

    it('should call licence service to update the additional condition data', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'code1', id: 1 },
        {},
        {
          username: 'joebloggs',
        }
      )
    })

    it('should redirect to the callback function', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-pss-conditions/callback?fromReview=true'
      )
    })
  })

  describe('DELETE', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditions = jest.fn()
      res.locals.licence = {
        id: 1,
        additionalPssConditions: [
          {
            id: 1,
            code: 'code1',
          },
          {
            id: 2,
            code: 'code2',
          },
        ],
      }
    })

    it('should call licence service to update the additional conditions with the condition removed', async () => {
      await handler.DELETE(req, res)
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(
        1,
        'PSS',
        {
          additionalConditions: ['code2'],
        },
        {
          username: 'joebloggs',
        }
      )
    })

    it('should redirect to the callback function', async () => {
      await handler.DELETE(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.DELETE(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-pss-conditions/callback?fromReview=true'
      )
    })
  })
})
