import { Request, Response } from 'express'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'
import { AddAddressRequest, AddHdcCurfewAddressRequest } from '../../../../@types/licenceApiClientTypes'
import { LicenceIdParams } from '../../../types/routeParams'

export default class ManualAddressEntryRoutes {
  constructor(private readonly hdcCurfewAddressService: HdcCurfewAddressService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''
    const basePath = `/licence/vary/id/${licenceId}/hdc`
    res.render('pages/vary/hdc/manualAddressEntry', {
      postcodeLookupUrl: `${basePath}/find-the-new-curfew-address${fromReviewParam}`,
    })
  }

  POST = async (req: Request<LicenceIdParams>, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const addHdcCurfewAddressRequest = {
      address: { ...req.body, source: 'MANUAL' } as AddAddressRequest,
      accommodationType: req.session.curfewAccommodationType,
      postReleaseResidentialChecksCompleted: req.session.curfewAddressChecksCompleted,
      postReleaseResidentialChecksNotCompletedReason: req.session.curfewAddressChecksIncompleteReason,
    } as AddHdcCurfewAddressRequest

    await this.hdcCurfewAddressService.updateHdcCurfewAddress(
      parseInt(licenceId, 10),
      addHdcCurfewAddressRequest,
      res.locals.user,
    )

    res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
