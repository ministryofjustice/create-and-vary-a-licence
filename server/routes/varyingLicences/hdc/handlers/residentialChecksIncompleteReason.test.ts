import { Request, Response } from 'express'
import ResidentialChecksIncompleteReasonRoutes from './residentialChecksIncompleteReason'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'

jest.mock('../../../../services/hdc/hdcCurfewAddressService')

const hdcCurfewAddressService = new HdcCurfewAddressService(null) as jest.Mocked<HdcCurfewAddressService>

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new ResidentialChecksIncompleteReasonRoutes(hdcCurfewAddressService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      body: {},
      query: {},
      session: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        licence: { id: 1 },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/residentialChecksIncompleteReason')
    })
  })

  describe('POST', () => {
    it('should store the incomplete reason and redirect to find address page (not from review)', async () => {
      req.body = { reason: 'Reason' }
      req.query = {}
      req.session.curfewAddressChecksIncompleteReason = 'Old reason'

      await handler.POST(req, res)

      expect(req.session.curfewAddressChecksIncompleteReason).toBe('Reason')

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/find-the-new-curfew-address')

      expect(hdcCurfewAddressService.updateResidentialChecks).not.toHaveBeenCalled()
    })

    it('should store reason, call service with false, and redirect to check-your-answers when from review', async () => {
      req.body = { reason: 'New reason' }
      req.query = { fromReview: 'true' }

      await handler.POST(req, res)

      expect(req.session.curfewAddressChecksIncompleteReason).toBe('New reason')

      expect(hdcCurfewAddressService.updateResidentialChecks).toHaveBeenCalledWith(
        res.locals.licence,
        false,
        'New reason',
        res.locals.user,
      )

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
