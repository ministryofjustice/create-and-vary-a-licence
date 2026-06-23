import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ReasonForVariationRoutes from './reasonForVariation'
import { VariationChanges } from '../../../utils/licenceComparator'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Reason for variation', () => {
  const handler = new ReasonForVariationRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
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
        hasUpdatedCurfewAddress: false,
        hasUpdatedCurfewHours: false,
      } as VariationChanges)

      await handler.GET(req, res)

      expect(licenceService.compareVariationToOriginal).toHaveBeenCalledWith(
        { id: 1, statusCode: LicenceStatus.VARIATION_IN_PROGRESS },
        { username: 'joebloggs' },
      )
      expect(res.render).toHaveBeenCalledWith('pages/vary/reasonForVariation', {
        variationChanges: {
          licenceConditionsAdded: [],
          hasUpdatedCurfewAddress: false,
          hasUpdatedCurfewHours: false,
        },
      })
    })
  })

  describe('POST', () => {
    it('should update reason for variation', async () => {
      req.body = { reasonForVariation: 'Reason' }
      await handler.POST(req, res)

      expect(licenceService.updateReasonForVariation).toHaveBeenCalledWith(
        '1',
        { reasonForVariation: 'Reason' },
        { username: 'joebloggs' },
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/summary')
    })
  })
})
