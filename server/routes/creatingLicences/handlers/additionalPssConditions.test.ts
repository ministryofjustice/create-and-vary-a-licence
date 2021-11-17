import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import * as conditionsProvider from '../../../utils/conditionsProvider'
import LicenceType from '../../../enumeration/licenceType'
import AdditionalPssConditionsRoutes from './additionalPssConditions'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

jest
  .spyOn(conditionsProvider, 'getGroupedAdditionalConditions')
  .mockReturnValue([{ groupName: 'group1', conditions: [{ code: 'condition1' }] }])

describe('Route Handlers - Create Licence - Additional Pss Conditions', () => {
  const handler = new AdditionalPssConditionsRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
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
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalPssConditions', {
        additionalConditions: [
          {
            groupName: 'group1',
            conditions: [{ code: 'condition1' }],
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
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(1, LicenceType.PSS, {}, 'joebloggs')
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
})
