import { Request, Response } from 'express'
import logger from '../../../../logger'
import config from '../../../config'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import { Licence } from '../../../@types/licenceApiClientTypes'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'

const pdfHeaderFooterStyle =
  'font-family: Arial; ' +
  'font-size: 10px; ' +
  'font-weight: normal; ' +
  'width: 100%; ' +
  'height: 35px; ' +
  'text-align: center; ' +
  'padding: 20px;'

export default class PrintLicenceRoutes {
  constructor(private readonly prisonerService: PrisonerService, private readonly qrCodeService: QrCodeService) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence } = res.locals // fetchLicence middleware populates
    const htmlPrint = true
    const qrCode = await this.qrCodeService.getQrCode(licence)
    const additionalConditions = expandAdditionalConditions(licence.additionalConditions)
    logger.info(`HTML preview licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
    res.render(`pages/licence/${licence.typeCode}`, { additionalConditions, qrCode, htmlPrint })
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence } = res.locals
    const { licencesUrl, pdfOptions } = config.apis.gotenberg
    const additionalConditions = expandAdditionalConditions(licence.additionalConditions)
    const imageData = await this.prisonerService.getPrisonerImageData(username, licence.nomsId)
    const qrCode = await this.qrCodeService.getQrCode(licence)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    const footerHtml = this.getPdfFooter(licence)

    logger.info(`PDF print licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
    res.renderPDF(
      `pages/licence/${licence.typeCode}`,
      { licencesUrl, imageData, additionalConditions, qrCode, htmlPrint: false },
      { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
    )
  }

  getPdfFooter = (licence: Licence): string => {
    return `
      <span style="${pdfHeaderFooterStyle}">
        <table style="width: 100%; padding-left: 15px; padding-right: 15px;">
          <tr>
            <td style="text-align: center;">NOMS No: <span style="font-weight: bold;">${licence.nomsId}</span></td>
            <td style="text-align: center;">Booking No: <span style="font-weight: bold;">${licence.bookingNo}</span></td>
            <td style="text-align: center;">CRO No: <span style="font-weight: bold;">${licence.cro}</span></td>
            <td style="text-align: center;">PNC ID: <span style="font-weight: bold;">${licence.pnc}</span></td>
          </tr>
        </table>
        <p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span><br/>
             <span style="font-size: 6px;">[${licence.typeCode}/${licence.id}/${licence.version}/${licence.prisonCode}]</span>
        </p>
     </span>`
  }
}
