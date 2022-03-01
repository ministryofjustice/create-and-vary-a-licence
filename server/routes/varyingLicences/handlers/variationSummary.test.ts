import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import VariationSummaryRoutes from './variationSummary'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { VariedConditions } from '../../../utils/licenceComparator'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Variation summary', () => {
  const handler = new VariationSummaryRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          id: 1,
          statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      licenceService.compareVariationToOriginal.mockResolvedValue({
        licenceConditionsAdded: [],
      } as VariedConditions)

      await handler.GET(req, res)

      expect(licenceService.compareVariationToOriginal).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_IN_PROGRESS },
        { username: 'joebloggs' }
      )
      expect(res.render).toHaveBeenCalledWith('pages/vary/variationSummary', {
        conditionComparison: {
          licenceConditionsAdded: [],
        },
      })
    })
  })

  describe('POST', () => {
    it('should submit the variation response and redirect to the confirmation page', async () => {
      await handler.POST(req, res)

      expect(licenceService.submitLicence).toHaveBeenCalledWith(1, { username: 'joebloggs' })
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/confirmation')
    })
  })
})
