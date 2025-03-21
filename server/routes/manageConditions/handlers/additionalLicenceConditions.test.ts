import { Request, Response } from 'express'

import AdditionalLicenceConditionsRoutes from './additionalLicenceConditions'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import ConditionService from '../../../services/conditionService'

jest.mock('../../../services/conditionService')

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>

conditionService.getGroupedAdditionalConditions.mockResolvedValue([
  {
    category: 'group1',
    conditions: [{ text: 'Condition 1', code: 'condition1', category: 'group1', requiresInput: false }],
  },
])

describe('Route Handlers - Create Licence - Additional Licence Conditions', () => {
  const handler = new AdditionalLicenceConditionsRoutes(licenceService, conditionService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
      body: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          version: 'version',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/additionalLicenceConditions', {
        additionalConditions: [
          {
            category: 'group1',
            conditions: [{ text: 'Condition 1', code: 'condition1', category: 'group1', requiresInput: false }],
          },
        ],
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateAdditionalConditions = jest.fn()
    })

    it('should call licence service to update the list of additional conditions', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(
        1,
        LicenceType.AP,
        {},
        { username: 'joebloggs' },
        'version',
      )
    })

    it('should redirect to the callback function', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
    })

    it('should redirect to the callback function with query parameter if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true',
      )
    })
  })
})
