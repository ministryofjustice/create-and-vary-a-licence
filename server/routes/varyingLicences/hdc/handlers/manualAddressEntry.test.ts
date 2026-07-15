import { Request, Response } from 'express'
import ManualAddressEntryRoutes from './manualAddressEntry'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'
import CurfewAccommodationType from '../../../../enumeration/curfewAccommodationType'
import { LicenceIdParams } from '../../../types/routeParams'

jest.mock('../../../../services/hdc/hdcCurfewAddressService')

const hdcCurfewAddressService = new HdcCurfewAddressService(null) as jest.Mocked<HdcCurfewAddressService>

describe('Route Handlers - Create a licence - Manual address entry', () => {
  let req: Request<LicenceIdParams>
  let res: Response
  const handler = new ManualAddressEntryRoutes(hdcCurfewAddressService)

  describe('manual curfew address entry', () => {
    beforeEach(() => {
      req = {
        params: {
          licenceId: 1,
        },
        body: {},
        query: {},
        session: {},
      } as unknown as Request<LicenceIdParams>

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

        expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/manualAddressEntry', {
          postcodeLookupUrl: `/licence/vary/id/1/hdc/find-the-new-curfew-address`,
        })
      })

      it('should render the manual address address entry page in edit flow', async () => {
        req.query.fromReview = 'true'
        await handler.GET(req, res)

        expect(res.render).toHaveBeenCalledWith('pages/vary/hdc/manualAddressEntry', {
          postcodeLookupUrl: `/licence/vary/id/1/hdc/find-the-new-curfew-address?fromReview=true`,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the check your answers page with the entered address when the address is valid', async () => {
        req.session.curfewAccommodationType = CurfewAccommodationType.RESIDENTIAL
        req.session.curfewAddressChecksCompleted = false
        req.session.curfewAddressChecksIncompleteReason = 'Reason for incomplete checks'

        req.body = {
          firstLine: '123 Fake Street',
          secondLine: 'Apt 4',
          town: 'Faketown',
          county: 'Fakecounty',
          postcode: 'FK1 2AB',
        }

        await handler.POST(req, res)

        expect(hdcCurfewAddressService.updateHdcCurfewAddress).toHaveBeenCalledWith(
          1,
          {
            address: {
              firstLine: '123 Fake Street',
              secondLine: 'Apt 4',
              town: 'Faketown',
              county: 'Fakecounty',
              postcode: 'FK1 2AB',
              source: 'MANUAL',
            },
            accommodationType: CurfewAccommodationType.RESIDENTIAL,
            postReleaseResidentialChecksCompleted: false,
            postReleaseResidentialChecksNotCompletedReason: 'Reason for incomplete checks',
          },
          res.locals.user,
        )

        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
      })
    })
  })
})
