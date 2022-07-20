import { Request, Response } from 'express'

import LicenceService from '../../../services/licenceService'
import ConfirmAmendVariationRoutes from './confirmAmendVariation'
import LicenceStatus from '../../../enumeration/licenceStatus'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>
jest.mock('../../../services/licenceService')

describe('Route Handlers - Vary Licence - Confirm amend variation', () => {
  const handler = new ConfirmAmendVariationRoutes(licenceService)
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
          version: '1.1',
        },
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/confirmAmendVariation')
    })
  })

  describe('POST', () => {
    it('should update status to in progress when answer is yes', async () => {
      req.body = { answer: 'Yes' }
      await handler.POST(req, res)

      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.VARIATION_IN_PROGRESS, {
        username: 'joebloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should redirect to view variation when answer is no', async () => {
      req.body = { answer: 'No' }
      await handler.POST(req, res)

      expect(licenceService.updateStatus).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/view')
    })
  })
})
