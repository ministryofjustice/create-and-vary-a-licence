import { Request, Response } from 'express'
import { getFooter, getHeader, pdfOptions } from '../../../utils/pdfFormat'
import logger from '../../../../logger'
import config from '../../../config'
import LicenceService from '../../../services/licenceService'

export default class PdfRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { id } = req.params
    const licence = this.licenceService.getLicenceForPdf()
    const headerHtml = getHeader(licence)
    const footerHtml = getFooter(licence)
    logger.info(`Request to preview licence ${id} from user ${username}`)
    res.render(`pages/licence/preview`, { licence, headerHtml, footerHtml })
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { id } = req.params
    const licence = this.licenceService.getLicenceForPdf()
    logger.info(`Request to print PDF for licence ${id} from user ${username}`)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    const headerHtml = getHeader(licence)
    const footerHtml = getFooter(licence)
    // Specify licencesUrl so that it is used in the NJK template as http://host.docker.internal:3000/assets
    const { licencesUrl } = config.apis.gotenberg
    res.renderPDF(
      `pages/licence/preview`,
      { licencesUrl, licence },
      { filename, pdfOptions: { ...pdfOptions, headerHtml, footerHtml } }
    )
  }
}
