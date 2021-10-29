import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import logger from '../../../../logger'

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
    const { username } = res.locals.user
    const { licenceId, result } = req.body

    logger.info(`POST - print a licence ID=${licenceId} result = ${result} username ${username}`)

    if (result === 'print') {
      res.redirect(`/licence/view/id/${licenceId}/html-print`)
      // res.redirect(`/licence/id/${licenceId}/pdf-print`)
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }
}
