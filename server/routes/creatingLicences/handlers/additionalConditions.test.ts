import { Request, Response } from 'express'

import AdditionalConditionsRoutes from './additionalConditions'
import LicenceService from '../../../services/licenceService'
import * as conditionsProvider from '../../../utils/conditionsProvider'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

jest
  .spyOn(conditionsProvider, 'getGroupedAdditionalConditions')
  .mockReturnValue([{ groupName: 'group1', conditions: [{ code: 'condition1' }] }])

describe('Route Handlers - Create Licence - Additional Conditions', () => {
  const handler = new AdditionalConditionsRoutes(licenceService)
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
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/additionalConditions', {
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
      expect(licenceService.updateAdditionalConditions).toHaveBeenCalledWith(1, {}, 'joebloggs')
    })

    it('should redirect to the bespoke conditions question page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions-question')
    })

    it('should redirect to the check your answers page if fromReview flag is true', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
