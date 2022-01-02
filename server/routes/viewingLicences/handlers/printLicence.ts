import { Request, Response } from 'express'
import logger from '../../../../logger'
import config from '../../../config'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition, Licence } from '../../../@types/licenceApiClientTypes'
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
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly qrCodeService: QrCodeService,
    private readonly licenceService: LicenceService
  ) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence, user } = res.locals // fetchLicence middleware populates
    const { qrCodesEnabled } = res.locals
    const htmlPrint = true
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const additionalLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const additionalPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
    const conditionIdWithUpload = this.getConditionWithUpload(additionalLicenceConditions)
    const exclusionZoneMapData =
      conditionIdWithUpload !== 0
        ? await this.licenceService.getExclusionZoneImageData(licence.id, `${conditionIdWithUpload}`, user)
        : null
    const exclusionZoneDescription =
      conditionIdWithUpload !== 0 ? this.getExclusionZoneDescription(additionalLicenceConditions) : null

    logger.info(`HTML preview licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)

    res.render(`pages/licence/${licence.typeCode}`, {
      additionalLicenceConditions,
      additionalPssConditions,
      qrCode,
      htmlPrint,
      exclusionZoneDescription,
      exclusionZoneMapData,
    })
    logger.info(`HTML preview licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licence, user } = res.locals
    const { qrCodesEnabled } = res.locals
    const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const additionalLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const additionalPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
    const imageData = await this.prisonerService.getPrisonerImageData(licence.nomsId, user)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    const footerHtml = this.getPdfFooter(licence)
    const conditionIdWithUpload = this.getConditionWithUpload(additionalLicenceConditions)
    const exclusionZoneMapData =
      conditionIdWithUpload !== 0
        ? await this.licenceService.getExclusionZoneImageData(licence.id, `${conditionIdWithUpload}`, user)
        : null
    const exclusionZoneDescription =
      conditionIdWithUpload !== 0 ? this.getExclusionZoneDescription(additionalLicenceConditions) : null

    logger.info(`PDF print licence ID [${licence.id}] type [${licence.typeCode}] by user [${username}]`)

    res.renderPDF(
      `pages/licence/${licence.typeCode}`,
      {
        licencesUrl,
        imageData,
        additionalLicenceConditions,
        additionalPssConditions,
        qrCode,
        htmlPrint: false,
        watermark,
        exclusionZoneDescription,
        exclusionZoneMapData,
      },
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

  getConditionWithUpload = (additionalConditions: AdditionalCondition[]): number => {
    let conditionId = 0
    additionalConditions.forEach(condition => {
      if (condition?.uploadSummary?.length > 0) {
        conditionId = condition.id
      }
    })
    return conditionId
  }

  getExclusionZoneDescription = (additionalConditions: AdditionalCondition[]): string => {
    let description = ''
    additionalConditions.forEach(condition => {
      if (condition?.uploadSummary?.length > 0) {
        description = condition.uploadSummary[0]?.description
      }
    })
    return description
  }
}
