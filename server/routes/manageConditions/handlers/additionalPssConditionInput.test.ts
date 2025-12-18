import { Request, Response } from 'express'
import ConditionService from '../../../services/conditionService'

import LicenceService from '../../../services/licenceService'
import AdditionalPssConditionInputRoutes from './additionalPssConditionInput'
import { Licence } from '../../../@types/licenceApiClientTypes'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>
const conditionsProviderSpy = jest.spyOn(conditionService, 'getAdditionalConditionByCode')

jest.mock('../../../services/licenceService')

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
      conditionsProviderSpy.mockResolvedValue({
        text: 'Condition 1',
        code: 'code1',
        category: 'group1',
        requiresInput: true,
        inputs: [],
      })

      res.locals.licence = {
        version: 'version',
        additionalPssConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      } as Licence

      await handler.GET(req, res)
      expect(conditionsProviderSpy).toHaveBeenCalledWith('code1', 'version')
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/additionalPssConditionInput', {
        additionalCondition: {
          id: 1,
          code: 'code1',
        },
        config: {
          text: 'Condition 1',
          code: 'code1',
          category: 'group1',
          requiresInput: true,
          inputs: [],
        },
      })
    })

    it('should redirect to additional PSS conditions list page if the additional condition is not found on the licence', async () => {
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions')
    })

    it('should redirect to additional conditions list page with fromReviewFlag if the additional condition is not found on the licence', async () => {
      req.query.fromReview = 'true'
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions?fromReview=true')
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      res.locals.licence = {
        additionalPssConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      } as Licence
    })

    it('should call licence service to update the additional condition data', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'code1', id: 1 },
        {},
        {
          username: 'joebloggs',
        },
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
        '/licence/create/id/1/additional-pss-conditions/callback?fromReview=true',
      )
    })
  })

  describe('DELETE', () => {
    beforeEach(() => {
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
        version: 'version',
      } as Licence
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
        },
        'version',
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
        '/licence/create/id/1/additional-pss-conditions/callback?fromReview=true',
      )
    })
  })

  describe('SKIP', () => {
    beforeEach(() => {
      res.locals.licence = {
        id: 1,
        additionalPssConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      } as Licence
    })

    it('should call licence service to update the additional condition data with the skipped placeholder value', async () => {
      await handler.SKIP(req, res)
      expect(licenceService.updateAdditionalConditionData).toHaveBeenCalledWith(
        '1',
        { code: 'code1', id: 1 },
        { conditionSkipped: '[DATE REQUIRED]' },
        {
          username: 'joebloggs',
        },
      )
    })

    it('should redirect to the callback function', async () => {
      await handler.SKIP(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-pss-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.SKIP(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-pss-conditions/callback?fromReview=true',
      )
    })
  })
})
