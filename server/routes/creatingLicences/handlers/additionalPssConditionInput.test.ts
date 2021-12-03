import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import * as conditionsProvider from '../../../utils/conditionsProvider'
import AdditionalPssConditionInputRoutes from './additionalPssConditionInput'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const conditionsProviderSpy = jest.spyOn(conditionsProvider, 'getAdditionalConditionByCode')

describe('Route Handlers - Create Licence - Additional Licence Condition Input', () => {
  const handler = new AdditionalPssConditionInputRoutes(licenceService)
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
      user: {
        username: 'joebloggs',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          additionalPssConditions: [],
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view with the additional condition and its config', async () => {
      conditionsProviderSpy.mockReturnValue({
        inputs: [],
      })

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
          inputs: [],
        },
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditionData = jest.fn()
    })

    it('should call licence service to update the additional condition data', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith('1', '1', {}, 'joebloggs')
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
        'joebloggs'
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
