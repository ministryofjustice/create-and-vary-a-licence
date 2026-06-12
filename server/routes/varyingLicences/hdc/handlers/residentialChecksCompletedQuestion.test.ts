import { Request, Response } from 'express'
import ResidentialChecksCompletedQuestionRoutes from './residentialChecksCompletedQuestion'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'
import YesOrNo from '../../../../enumeration/yesOrNo'

jest.mock('../../../../services/hdc/hdcCurfewAddressService')

const hdcCurfewAddressService = new HdcCurfewAddressService(null) as jest.Mocked<HdcCurfewAddressService>

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new ResidentialChecksCompletedQuestionRoutes(hdcCurfewAddressService)
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
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/residentialChecksCompletedQuestion')
    })
  })

  describe('POST', () => {
    it('should clear incomplete reason and redirect to find address when checks complete (not from review)', async () => {
      req.body = { answer: YesOrNo.YES }
      req.query = {}
      req.session.curfewAddressChecksIncompleteReason = 'outdated reason'

      await handler.POST(req, res)

      expect(req.session.curfewAddressChecksIncompleteReason).toBeNull()
      expect(req.session.curfewAddressChecksCompleted).toBe(true)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/find-the-new-curfew-address')

      expect(hdcCurfewAddressService.updateResidentialChecks).not.toHaveBeenCalled()
    })

    it('should redirect to incomplete page when checks not complete (not from review)', async () => {
      req.body = { answer: YesOrNo.NO }
      req.query = {}

      await handler.POST(req, res)

      expect(req.session.curfewAddressChecksCompleted).toBe(false)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/residential-checks-incomplete')
    })

    it('should append fromReview=true when checks are not complete from review', async () => {
      req.body = { answer: YesOrNo.NO }
      req.query = { fromReview: 'true' }

      await handler.POST(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/residential-checks-incomplete?fromReview=true')
    })

    it('should update service and redirect to check-your-answers when from review and checks complete', async () => {
      req.body = { answer: YesOrNo.YES }
      req.query = { fromReview: 'true' }

      await handler.POST(req, res)

      expect(hdcCurfewAddressService.updateResidentialChecks).toHaveBeenCalledWith(
        res.locals.licence,
        true,
        null,
        res.locals.user,
      )

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')

      expect(req.session.curfewAddressChecksCompleted).toBe(true)
      expect(req.session.curfewAddressChecksIncompleteReason).toBeNull()
    })
  })
})
