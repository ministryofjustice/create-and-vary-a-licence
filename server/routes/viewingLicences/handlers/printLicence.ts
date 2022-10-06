import { Request, Response } from 'express'
import config from '../../../config'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import { AdditionalCondition, Licence } from '../../../@types/licenceApiClientTypes'
import { User } from '../../../@types/CvlUserDetails'

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
    const { licence, user } = res.locals // fetchLicence middleware populates
    const { qrCodesEnabled } = res.locals
    const htmlPrint = true
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const conditionsWithUploads = this.getConditionsWithUploads(licence.additionalLicenceConditions)
    const exclusionZoneMapData = await this.getExclusionZones(licence, conditionsWithUploads, user)

    // Recorded here as we do not know the reason for the fetchLicence within the API
    await this.licenceService.recordAuditEvent(
      `Licence printed for ${licence?.forename} ${licence?.surname} (HTML)`,
      `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
      licence.id,
      new Date(),
      user
    )

    res.render(`pages/licence/${licence.typeCode}`, {
      qrCode,
      htmlPrint,
      exclusionZoneMapData,
    })
  }

  renderPdf = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { qrCodesEnabled } = res.locals
    const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
    const qrCode = qrCodesEnabled ? await this.qrCodeService.getQrCode(licence) : null
    const imageData = await this.prisonerService.getPrisonerImageData(licence.nomsId, user)
    const filename = licence.nomsId ? `${licence.nomsId}.pdf` : `${licence.lastName}.pdf`
    const footerHtml = this.getPdfFooter(licence)
    const additionalConditionsWithUploads = this.getConditionsWithUploads(licence.additionalLicenceConditions)
    const exclusionZoneMapData = await this.getExclusionZones(licence, additionalConditionsWithUploads, user)

    // Recorded here as we do not know the reason for the fetchLicence within the API
    await this.licenceService.recordAuditEvent(
      `Licence printed for ${licence?.forename} ${licence?.surname} (PDF)`,
      `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
      licence.id,
      new Date(),
      user
    )

    const additionalConditions = licence.additionalLicenceConditions.filter(
      (c: AdditionalCondition) => !licence.additionalLicenceConditions.find((c2: AdditionalCondition) => c.id === c2.id)
    )

    res.renderPDF(
      `pages/licence/${licence.typeCode}`,
      {
        licencesUrl,
        imageData,
        qrCode,
        htmlPrint: false,
        watermark,
        additionalConditions,
        additionalConditionsWithUploads,
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
            <td style="text-align: center;">Prison: <span style="font-weight: bold;">${licence.prisonDescription}</span></td>
          </tr>
        </table>
        <p>
        Page <span class="pageNumber"></span> of <span class="totalPages"></span><br/>
             <span style="font-size: 6px;">[${licence.typeCode}/${licence.id}/${licence.version}/${licence.prisonCode}]</span>
        </p>
     </span>`
  }

  getConditionsWithUploads = (additionalConditions: AdditionalCondition[]): AdditionalCondition[] => {
    return additionalConditions.filter(condition => condition?.uploadSummary?.length > 0)
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
      })
    )
  }
}
