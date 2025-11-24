import { Request, Response } from 'express'
import UserType from '../../../enumeration/userType'

export default class NoAddressFoundRoutes {
  constructor(private readonly userType: UserType) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const isPrisonUser = this.userType === UserType.PRISON
    const fromReview = req.query?.fromReview
    const fromReviewParam = fromReview ? '?fromReview=true' : ''
    const basePath = `/licence/${isPrisonUser ? 'view' : 'create'}/id/${licenceId}`

    return res.render('pages/initialAppointment/noAddressFound', {
      searchQuery,
      postcodeLookupSearchUrl: `${basePath}/initial-meeting-place${fromReviewParam}`,
      manualAddressEntryUrl: `${basePath}/manual-address-entry${fromReviewParam}`,
    })
  }
}
