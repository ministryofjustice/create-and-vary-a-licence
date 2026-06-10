import { Request, Response } from 'express'
import CurfewAccommodationType from '../../../../enumeration/curfewAccommodationType'

export default class AccommodationTypeQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/accommodationTypeQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { accommodationType } = req.body
    const { licenceId } = req.params

    req.session.curfewAccommodationType = accommodationType

    if (accommodationType === CurfewAccommodationType.CAS) {
      req.session.curfewAddressChecksIncompleteReason = null
      req.session.curfewAddressChecksCompleted = null
      return res.redirect(`/licence/vary/id/${licenceId}/hdc/find-the-new-curfew-address`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/hdc/address-checks`)
  }
}
