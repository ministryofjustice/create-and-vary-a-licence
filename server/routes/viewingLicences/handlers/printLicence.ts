import { Request, Response } from 'express'
import config from '../../../config'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition, Licence } from '../../../@types/licenceApiClientTypes'
import { User } from '../../../@types/CvlUserDetails'
import { isHdcLicence } from '../../../utils/utils'
import {
  MEZ_CONDITION_CODE,
  RESTRICTION_ZONE_CONDITION_CODE,
  EVENT_RESTRICTION_CONDITION_CODE,
} from '../../../utils/conditionRoutes'

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
  ) {}

  preview = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals // fetchLicence middleware populates
    const { qrCodesEnabled } = res.locals
    const htmlPrint = true
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const { exclusionZoneMapData, restrictionZoneMapData, eventExclusionZoneMapData } =
      await this.splitUploadConditions(licence, user)
    const isV4OrGreater = this.isLicenceV4OrGreater(licence)

    // Recorded here as we do not know the reason for the fetchLicence within the API
    await this.licenceService.recordAuditEvent(
      `Licence printed for ${licence?.forename} ${licence?.surname} (HTML)`,
      `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
      licence.id,
      new Date(),
      user,
    )

    const { singleItemConditions, multipleItemConditions } = this.groupConditions(licence)

    const licenceToPrint = {
      qrCode,
      licence,
      htmlPrint,
      singleItemConditions,
      multipleItemConditions,
      exclusionZoneMapData,
      restrictionZoneMapData,
      eventExclusionZoneMapData,
      isV4OrGreater,
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
    const { exclusionZoneMapData, restrictionZoneMapData, eventExclusionZoneMapData } =
      await this.splitUploadConditions(licence, user)
    const isV4OrGreater = this.isLicenceV4OrGreater(licence)

    // Recorded here as we do not know the reason for the fetchLicence within the API
    await this.licenceService.recordAuditEvent(
      `Licence printed for ${licence?.forename} ${licence?.surname} (PDF)`,
      `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
      licence.id,
      new Date(),
      user,
    )

    const { singleItemConditions, multipleItemConditions } = this.groupConditions(licence)

    const { monitoringSupplierTelephone } = config

    const { prisonTelephone } = licence

    const licenceToPrint = {
      licencesUrl,
      licence,
      imageData,
      qrCode,
      htmlPrint: false,
      watermark,
      singleItemConditions,
      multipleItemConditions,
      exclusionZoneMapData,
      restrictionZoneMapData,
      eventExclusionZoneMapData,
      prisonTelephone,
      monitoringSupplierTelephone,
      isV4OrGreater,
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

  private async splitUploadConditions(licence: Licence, user: User) {
    const additionalConditionsWithUploads = this.getConditionsWithUploads(licence.additionalLicenceConditions)

    const byConditionCode = (code: string) =>
      this.getExclusionZones(
        licence,
        additionalConditionsWithUploads.filter(condition => condition.code === code),
        user,
      )

    const [exclusionZoneMapData, restrictionZoneMapData, eventExclusionZoneMapData] = await Promise.all([
      byConditionCode(MEZ_CONDITION_CODE),
      byConditionCode(RESTRICTION_ZONE_CONDITION_CODE),
      byConditionCode(EVENT_RESTRICTION_CONDITION_CODE),
    ])

    return { exclusionZoneMapData, restrictionZoneMapData, eventExclusionZoneMapData }
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
        const description = c.uploadSummary[0]?.description.trim()
        const dataValue = c.data.find(d => d.field === 'outOfBoundArea')
        const { text } = c
        return {
          mapData,
          description,
          dataValue,
          text,
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

  isLicenceV4OrGreater(licence: Licence): boolean {
    return !['1.0', '2.0', '2.1', '3.0'].includes(licence.version)
  }

  getTemplateForLicence(licence: Licence): string {
    const licenceType = licence.typeCode
    if (isHdcLicence(licence)) {
      return `HDC_${licenceType}`
    }
    return licenceType
  }
}
