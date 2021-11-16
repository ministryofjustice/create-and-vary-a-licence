import { Request, Response } from 'express'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class ViewAndPrintLicenceRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    if (licence?.statusCode === LicenceStatus.APPROVED || licence?.statusCode === LicenceStatus.ACTIVE) {
      res.render('pages/view/view')
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
