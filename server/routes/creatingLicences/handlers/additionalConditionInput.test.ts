import { Request, Response } from 'express'

import AdditionalConditionInputRoutes from './additionalConditionInput'
import LicenceService from '../../../services/licenceService'
import * as conditionsProvider from '../../../utils/conditionsProvider'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
const conditionsProviderSpy = jest.spyOn(conditionsProvider, 'getAdditionalConditionByCode')

describe('Route Handlers - Create Licence - Additional Condition Input', () => {
  const handler = new AdditionalConditionInputRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        additionalConditionId: '1',
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
          additionalLicenceConditions: [],
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should throw 404 if the additional condition is not found on the licence', async () => {
      await expect(handler.GET(req, res)).rejects.toThrow('Additional condition not found')
      expect(res.status).toHaveBeenCalledWith(404)
    })

    it('should render view with the additional condition and its config', async () => {
      conditionsProviderSpy.mockReturnValue({
        inputs: [],
      })

      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
          },
        ],
      }

      await handler.GET(req, res)
      expect(conditionsProviderSpy).toHaveBeenCalledWith('code1')
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalConditionInput', {
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
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-conditions/callback?fromReview=true')
    })
  })
})
