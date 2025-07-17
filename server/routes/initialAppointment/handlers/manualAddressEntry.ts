import { Request, Response } from 'express'
import UserType from '../../../enumeration/userType'

export default class ManualAddressEntryRoutes {
  constructor(private readonly userType: UserType) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/manualAddressPostcodeLookupForm', {})
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const basePath = `/licence/create/id/${licenceId}`
    if (this.userType === UserType.PRISON) {
      res.redirect(`/licence/view/id/${licenceId}/show`)
    } else if (req.query?.fromReview) {
      res.redirect(`${basePath}/check-your-answers`)
    } else {
      res.redirect(`${basePath}/initial-meeting-contact`)
    }
  }
}
