import { Request, Response } from 'express'
import logger from '../../../../logger'
import config from '../../../config'
import PrisonerService from '../../../services/prisonerService'
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
  constructor(private readonly prisonerService: PrisonerService) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence } = res.locals
    const htmlPrint = true
    const additionalLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const additionalPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
    logger.info(`HTML preview licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
    res.render(`pages/licence/${licence.typeCode}`, { additionalLicenceConditions, additionalPssConditions, htmlPrint })
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence } = res.locals
    const { licencesUrl, pdfOptions } = config.apis.gotenberg
    const additionalLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const additionalPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
    const imageData = await this.prisonerService.getPrisonerImageData(username, licence.nomsId)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    const footerHtml = this.getPdfFooter(
      licence.nomsId,
      licence.cro,
      licence.bookingNo,
      licence.pnc,
      licence.typeCode,
      licence.id,
      licence.version,
      licence.prisonCode
    )
    logger.info(`PDF print licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
    res.renderPDF(
      `pages/licence/${licence.typeCode}`,
      { licencesUrl, imageData, additionalLicenceConditions, additionalPssConditions, htmlPrint: false },
      { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
    )
  }

  getPdfFooter = (
    nomsId: string,
    cro: string,
    bookingNo: string,
    pnc: string,
    licenceType: string,
    licenceId: string,
    version: string,
    prison: string
  ): string => {
    return `
      <span style="${pdfHeaderFooterStyle}">
        <table style="width: 100%; padding-left: 15px; padding-right: 15px;">
          <tr>
            <td style="text-align: center;">NOMS No: <span style="font-weight: bold;">${nomsId}</span></td>
            <td style="text-align: center;">Booking No: <span style="font-weight: bold;">${bookingNo}</span></td>
            <td style="text-align: center;">CRO No: <span style="font-weight: bold;">${cro}</span></td>
            <td style="text-align: center;">PNC ID: <span style="font-weight: bold;">${pnc}</span></td>
          </tr>
        </table>
        <p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span><br/>
             <span style="font-size: 6px;">[${licenceType}/${licenceId}/${version}/${prison}]</span>
        </p>
     </span>`
  }
}
