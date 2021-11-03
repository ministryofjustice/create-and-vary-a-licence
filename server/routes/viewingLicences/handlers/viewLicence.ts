import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ViewAndPrintLicenceRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    if (licence?.statusCode === LicenceStatus.APPROVED || licence?.statusCode === LicenceStatus.ACTIVE) {
      res.render('pages/view/view')
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
