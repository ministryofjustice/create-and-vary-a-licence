import { Request, Response } from 'express'
import LicenceReviewRoutes from './reviewLicence'
import LicenceService from '../../../services/licenceService'
import YesOrNo from '../../../enumeration/yesOrNo'

jest.mock('../../../services/licenceService')

describe('Review Hard Stop licence handler', () => {
  const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
  const handler = new LicenceReviewRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      body: {},
      flash: jest.fn(),
    } as unknown as Request
    res = {
      licence: {
        id: 1,
      },
      locals: { user: { username: 'bob' } },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render the review page', () => {
      handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/reviewLicence')
    })
  })

  describe('POST', () => {
    it('redirects to confirmVaryAction if the answer is yes and does not call to set the review date', () => {
      req.body.answer = YesOrNo.YES
      handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/confirm-vary-action')
      expect(req.flash).not.toHaveBeenCalled()
      expect(licenceService.reviewWithoutVariation).not.toHaveBeenCalled()
    })

    it('redirects to timeline if the answer is no and calls to set the review date', async () => {
      req.body.answer = YesOrNo.NO
      await handler.POST(req, res)
      expect(licenceService.reviewWithoutVariation).toHaveBeenCalledWith(1, { username: 'bob' })
      expect(req.flash).toHaveBeenCalledTimes(1)
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/timeline')
    })
  })
})
