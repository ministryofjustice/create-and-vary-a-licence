import { Request, Response } from 'express'
import AccommodationTypeQuestionRoutes from './accommodationTypeQuestion'

describe('Route Handlers - Vary Licence - Vlo discussion', () => {
  const handler = new AccommodationTypeQuestionRoutes()
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
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/accommodationTypeQuestion')
    })
  })

  describe('POST', () => {
    it('should store the address type and redirect to the address checks page if the accommodation type is Residential', async () => {
      req.body = { accommodationType: 'Residential' }
      await handler.POST(req, res)

      expect(req.session.curfewAccommodationType).toEqual('Residential')
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/address-checks')
    })

    it('should store the address type and redirect to the find address page if the accommodation type is CAS', async () => {
      req.body = { accommodationType: 'CAS' }
      await handler.POST(req, res)

      expect(req.session.curfewAccommodationType).toEqual('CAS')
      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/hdc/find-the-new-curfew-address')
      expect(req.session.curfewAddressChecksIncompleteReason).toBeNull()
      expect(req.session.curfewAddressChecksCompleted).toBeNull()
    })
  })
})
