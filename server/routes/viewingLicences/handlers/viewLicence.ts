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

  POST = async (req: Request, res: Response): Promise<void> => {
    /*
    TODO: Next ticket will act on the Print button - for now, go back to view cases list
    const { username } = res.locals.user
    const { licenceId, result } = req.body
    if (result === 'print') {
      res.redirect(`/licence/pdf/id/${licenceId}/print`)
    }
    */
    res.redirect(`/licence/view/cases`)
  }
}
