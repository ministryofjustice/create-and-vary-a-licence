import type { Request, Response } from 'express'
import ConditionService from '../../../services/conditionService'

import AdditionalLicenceConditionsCallbackRoutes from './additionalLicenceConditionsCallback'
import type { Licence } from '../../../@types/licenceApiClientTypes'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const conditionsProviderSpy = jest.spyOn(conditionService, 'getAdditionalConditionByCode')

describe('Route Handlers - Create Licence - Additional Conditions Callback', () => {
  const handler = new AdditionalLicenceConditionsCallbackRoutes(conditionService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
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
      locals: {
        licence: {
          additionalLicenceConditions: [],
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should redirect to the input page for the first additional condition in sequence which requires input but doesnt have any yet', async () => {
      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
            data: [
              {
                field: 'field1',
                value: 'value1',
              },
            ],
            sequence: 1,
          },
          {
            id: 2,
            code: 'code2',
            data: [],
            sequence: 3,
          },
          {
            id: 3,
            code: 'code3',
            data: [],
            sequence: 2,
          },
          {
            id: 4,
            code: 'code4',
            data: [],
            sequence: 4,
          },
        ],
      } as Licence

      conditionsProviderSpy.mockResolvedValueOnce({
        text: 'Condition 1',
        requiresInput: true,
        code: 'CON1',
        category: 'group1',
      })
      conditionsProviderSpy.mockResolvedValueOnce({
        text: 'Condition 2',
        requiresInput: false,
        code: 'CON2',
        category: 'group2',
      })
      conditionsProviderSpy.mockResolvedValueOnce({
        text: 'Condition 3',
        requiresInput: true,
        code: 'CON3',
        category: 'group3',
      })
      conditionsProviderSpy.mockResolvedValueOnce({
        text: 'Condition 4',
        requiresInput: true,
        code: 'CON4',
        category: 'group4',
      })

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/1/additional-licence-conditions/condition/3`)
    })

    it('should redirect to the input page with fromReview flag set', async () => {
      req.query.fromReview = 'true'
      res.locals.licence = {
        additionalLicenceConditions: [
          {
            id: 1,
            code: 'code1',
            data: [],
            sequence: 1,
          },
        ],
      } as Licence

      conditionsProviderSpy.mockResolvedValueOnce({
        text: 'Condition 1',
        requiresInput: true,
        code: 'CON1',
        category: 'group1',
      })

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/create/id/1/additional-licence-conditions/condition/1?fromReview=true`
      )
    })

    it('should redirect to the bespoke conditions question page if no conditions require input', async () => {
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/1/bespoke-conditions-question`)
    })

    it('should redirect to the check answers page fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/1/check-your-answers`)
    })
  })
})
