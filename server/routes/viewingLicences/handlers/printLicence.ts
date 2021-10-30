import { Request, Response } from 'express'
import logger from '../../../../logger'
import config from '../../../config'
import LicenceService from '../../../services/licenceService'

export default class PrintLicenceRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence } = res.locals
    logger.info(`HTML preview licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
    res.render(`pages/licence/${licence.typeCode}`, { licence })
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence } = res.locals

    // Specify licencesUrl so that it is used in the NJK template as http://host.docker.internal:3000/assets
    const { licencesUrl } = config.apis.gotenberg

    logger.info(`PDF print licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    res.renderPDF(`pages/licence/${licence.typeCode}`, { licencesUrl, licence }, { filename })
  }
}
