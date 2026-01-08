import { Request, Response } from 'express'
import config from '../../../config'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition, Licence } from '../../../@types/licenceApiClientTypes'
import { User } from '../../../@types/CvlUserDetails'
import HdcService from '../../../services/hdcService'
import { isHdcLicence } from '../../../utils/utils'

const pdfHeaderFooterStyle =
  'font-family: Arial; ' +
  'font-size: 10px; ' +
  'font-weight: normal; ' +
  'width: 100%; ' +
  'height: 55px; ' +
  'text-align: center; ' +
  'padding: 20px;'

export default class PrintLicenceRoutes {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly qrCodeService: QrCodeService,
    private readonly licenceService: LicenceService,
    private readonly hdcService: HdcService,
  ) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals // fetchLicence middleware populates
    const { qrCodesEnabled } = res.locals
    const htmlPrint = true
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const additionalConditionsWithUploads = this.getConditionsWithUploads(licence.additionalLicenceConditions)
    const exclusionZoneMapData = await this.getExclusionZones(licence, additionalConditionsWithUploads, user)

    // Recorded here as we do not know the reason for the fetchLicence within the API
    await this.licenceService.recordAuditEvent(
      `Licence printed for ${licence?.forename} ${licence?.surname} (HTML)`,
      `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
      licence.id,
      new Date(),
      user,
    )

    const { singleItemConditions, multipleItemConditions } = this.groupConditions(licence)

    const hdcLicenceData = isHdcLicence(licence) ? await this.hdcService.getHdcLicenceData(licence.id) : null

    const licenceToPrint = {
      qrCode,
      htmlPrint,
      singleItemConditions,
      multipleItemConditions,
      exclusionZoneMapData,
      hdcLicenceData,
    }

    res.render(`pages/licence/${this.getTemplateForLicence(licence)}`, licenceToPrint)
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { qrCodesEnabled } = res.locals
    const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const imageData = await this.prisonerService.getPrisonerImageData(licence.nomsId, user)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.surname}.pdf`
    const footerHtml = this.getPdfFooter(licence)
    const additionalConditionsWithUploads = this.getConditionsWithUploads(licence.additionalLicenceConditions)
    const exclusionZoneMapData = await this.getExclusionZones(licence, additionalConditionsWithUploads, user)

    // Recorded here as we do not know the reason for the fetchLicence within the API
    await this.licenceService.recordAuditEvent(
      `Licence printed for ${licence?.forename} ${licence?.surname} (PDF)`,
      `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
      licence.id,
      new Date(),
      user,
    )

    const { singleItemConditions, multipleItemConditions } = this.groupConditions(licence)

    const hdcLicenceData = isHdcLicence(licence) ? await this.hdcService.getHdcLicenceData(licence.id) : null

    const { monitoringSupplierTelephone } = config

    const { prisonTelephone } = licence

    const licenceToPrint = {
      licencesUrl,
      imageData,
      qrCode,
      htmlPrint: false,
      watermark,
      singleItemConditions,
      multipleItemConditions,
      exclusionZoneMapData,
      hdcLicenceData,
      prisonTelephone,
      monitoringSupplierTelephone,
    }

    res.renderPDF(`pages/licence/${this.getTemplateForLicence(licence)}`, licenceToPrint, {
      filename,
      pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions },
    })
  }

  private groupConditions(licence: Licence) {
    const groupedAdditionalConditions: Map<string, AdditionalCondition[]> = this.getGroupedAdditionalConditions(licence)
    const additionalConditions = Array.from(groupedAdditionalConditions, ([code, conditions]) => ({ code, conditions }))
    const singleItemConditions = additionalConditions.filter(v => v.conditions.length === 1).flatMap(v => v.conditions)
    const multipleItemConditions = additionalConditions.filter(v => v.conditions.length > 1).map(v => v.conditions)
    return { singleItemConditions, multipleItemConditions }
  }

  getPdfFooter = (licence: Licence): string => {
    let printVersion = licence.licenceVersion
    const majorVersion = licence.licenceVersion.split('.')[0]
    if (parseInt(majorVersion, 10) > 1) {
      printVersion = majorVersion
    }
    return `
      <div style="${pdfHeaderFooterStyle}">
        <table style="width: 100%; padding-left: 15px; padding-right: 15px;">
          <tr>
            <td style="text-align: left;">Prison No: <span style="font-weight: bold;">${licence.nomsId}</span></td>
            <td style="text-align: left;">Booking No: <span style="font-weight: bold;">${licence.bookingNo}</span></td>
            <td style="text-align: left;">CRO No: <span style="font-weight: bold;">${licence.cro || 'N/A'}</span></td>
            <td style="text-align: left;">PNC ID: <span style="font-weight: bold;">${licence.pnc}</span></td>
          </tr>
          <tr>
            <td style="text-align: left;">Prison: <span style="font-weight: bold;">${licence.prisonDescription}</span></td>
            <td style="text-align: left;">Version No: <span style="font-weight: bold">${printVersion}</span></td>
          </tr>
        </table>
        <p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span><br/>
             <span style="font-size: 6px;">[${licence.typeCode}/${licence.id}/${licence.version}/${licence.prisonCode}]</span>
        </p>
     </div>`
  }

  getConditionsWithUploads = (additionalConditions: AdditionalCondition[]): AdditionalCondition[] => {
    return additionalConditions.filter(condition => condition?.uploadSummary?.length > 0).sort((a, b) => a.id - b.id)
  }

  getExclusionZones(licence: Licence, conditionsWithUploads: AdditionalCondition[], user: User) {
    return Promise.all(
      conditionsWithUploads.map(async c => {
        const mapData = await this.licenceService.getExclusionZoneImageData(licence.id.toString(), `${c.id}`, user)
        const description = c.uploadSummary[0]?.description
        const dataValue = c.data.find(d => d.field === 'outOfBoundArea')
        return {
          mapData,
          description,
          dataValue,
        }
      }),
    )
  }

  getGroupedAdditionalConditions(licence: Licence): Map<string, AdditionalCondition[]> {
    const additionalConditions = licence.additionalLicenceConditions
    const map = new Map<string, AdditionalCondition[]>()
    additionalConditions.forEach((condition: AdditionalCondition) => {
      const collection = map.get(condition.code)
      if (!collection) {
        map.set(condition.code, [condition])
      } else {
        collection.push(condition)
      }
    })
    return map
  }

  getTemplateForLicence(licence: Licence): string {
    const licenceType = licence.typeCode
    if (isHdcLicence(licence)) {
      return `HDC_${licenceType}`
    }
    return licenceType
  }
}
