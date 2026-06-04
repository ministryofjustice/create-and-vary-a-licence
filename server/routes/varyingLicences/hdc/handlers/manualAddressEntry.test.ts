import { Request, Response } from 'express'
import ManualAddressEntryRoutes from './manualAddressEntry'

describe('Route Handlers - Create a licence - Manual address entry', () => {
  let req: Request
  let res: Response
  const handler = new ManualAddressEntryRoutes()

  describe('Hardstop licence prison user journey', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 1,
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
        },
      } as unknown as Response
    })
    describe('GET', () => {
      it('should render the manual address address entry page', async () => {
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/hdc/manualAddressEntry', {
          postcodeLookupUrl: `/licence/vary/id/1/hdc/find-the-new-curfew-address`,
        })
      })

      it('should render the manual address address entry page in edit flow', async () => {
        req.query.fromReview = 'true'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/hdc/manualAddressEntry', {
          postcodeLookupUrl: `/licence/vary/id/1/hdc/find-the-new-curfew-address?fromReview=true`,
        })
      })
    })

    describe('POST', () => {
      it('should call addAppointmentAddress and redirect to check-your-answers in edit flow', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/1/check-your-answers`)
      })
    })
  })
})
