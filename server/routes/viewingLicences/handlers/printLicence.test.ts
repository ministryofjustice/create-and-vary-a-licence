import { Request, Response } from 'express'

import PrintLicenceRoutes from './printLicence'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import config from '../../../config'
import HdcService, { CvlHdcLicenceData } from '../../../services/hdc/hdcService'
import { Licence } from '../../../@types/licenceApiClientTypes'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const qrCodeService = new QrCodeService() as jest.Mocked<QrCodeService>
const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>
const hdcService = new HdcService(null) as jest.Mocked<HdcService>

const username = 'joebloggs'

describe('Route - print a licence', () => {
  const handler = new PrintLicenceRoutes(prisonerService, qrCodeService, licenceService, hdcService)
  let req: Request
  let res: Response

  const exampleHdcLicenceData = {
    curfewAddress: {
      firstLine: 'addressLineOne',
      secondLine: 'addressLineTwo',
      townOrCity: 'addressTownOrCity',
      county: 'county',
      postcode: 'addressPostcode',
      source: 'MANUAL',
    },
    weeklyCurfewTimes: [],
    firstNightCurfewTimes: {
      fromTime: '09:00',
      untilTime: '17:00',
    },
    curfewTimes: [
      {
        curfewTimesSequence: 1,
        fromDay: 'MONDAY',
        fromTime: '17:00:00',
        untilDay: 'TUESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 2,
        fromDay: 'TUESDAY',
        fromTime: '17:00:00',
        untilDay: 'WEDNESDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 3,
        fromDay: 'WEDNESDAY',
        fromTime: '17:00:00',
        untilDay: 'THURSDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 4,
        fromDay: 'THURSDAY',
        fromTime: '17:00:00',
        untilDay: 'FRIDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 5,
        fromDay: 'FRIDAY',
        fromTime: '17:00:00',
        untilDay: 'SATURDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 6,
        fromDay: 'SATURDAY',
        fromTime: '17:00:00',
        untilDay: 'SUNDAY',
        untilTime: '09:00:00',
      },
      {
        curfewTimesSequence: 7,
        fromDay: 'MONDAY',
        fromTime: '17:00:00',
        untilDay: 'SUNDAY',
        untilTime: '09:00:00',
      },
    ],
    allCurfewTimesEqual: true,
  } as CvlHdcLicenceData

  beforeEach(() => {
    jest.resetAllMocks()
    req = {} as unknown as Request
    prisonerService.getPrisonerImageData = jest.fn()
    qrCodeService.getQrCode = jest.fn()
    licenceService.getExclusionZoneImageData = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    hdcService.getHdcLicenceData = jest.fn()

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      renderPDF: jest.fn(),
      locals: {
        user: { username },
        licence: {
          id: '1',
          kind: 'CRD',
          typeCode: 'AP',
          nomsId: 'A1234AA',
          lastName: 'Bloggs',
          cro: 'CRO',
          bookingNo: 'BOOKING',
          pnc: 'PNC',
          version: '1.0',
          prisonCode: 'MDI',
          prisonTelephone: '0114 2345232334',
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          licenceVersion: '1.4',
        },
        qrCodesEnabled: false,
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render a HTML view of an AP licence', async () => {
      res.locals.licence.typeCode = 'AP'

      qrCodeService.getQrCode.mockResolvedValue('a QR code')

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/AP', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        restrictionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: null,
        isV4OrGreater: false,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a HTML view of a PSS licence', async () => {
      res.locals.licence.typeCode = 'PSS'

      qrCodeService.getQrCode.mockResolvedValue('a QR code')

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/PSS', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        restrictionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: null,
        isV4OrGreater: false,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of an AP licence', async () => {
      res.locals.licence.typeCode = 'AP'

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/AP',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [],
          multipleItemConditions: [],
          exclusionZoneMapData: [],
          restrictionZoneMapData: [],
          hdcLicenceData: null,
          isV4OrGreater: false,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
      expect(footerHtml).toMatch(/Version No:.+1.4/)
      expect(footerHtml).toMatch(/CRO.*CRO/)
    })

    it('should print N/A for a null CRO on the PDF view of an AP licence', async () => {
      res.locals.licence.typeCode = 'AP'
      res.locals.licence.cro = null

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/AP',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [],
          multipleItemConditions: [],
          exclusionZoneMapData: [],
          restrictionZoneMapData: [],
          hdcLicenceData: null,
          isV4OrGreater: false,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
      expect(footerHtml).toMatch(/Version No:.+1.4/)
      expect(footerHtml).toMatch(/CRO.*N\/A/)
    })

    it('should strip the minor version number off a varied licence', async () => {
      res.locals.licence.version = '3.0'

      const footerHtml = handler.getPdfFooter(res.locals.licence)
      expect(footerHtml).toMatch(/Version No:.+<\/span>/)
    })

    it('should render a PDF view of an AP licence with exclusion zone data', async () => {
      res.locals.licence.additionalLicenceConditions = [
        {
          id: 1,
          code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
          text: 'some text',
          uploadSummary: [{ id: 1, description: 'Some words', fileSize: 0, uploadedTime: '' }],
          data: [{ field: 'outOfBoundArea', id: 0, sequence: 0, contributesToLicence: true }],
        },
      ]

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')
      licenceService.getExclusionZoneImageData.mockResolvedValue('base64 data')

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/AP',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [
            {
              code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
              data: [
                {
                  field: 'outOfBoundArea',
                  id: 0,
                  sequence: 0,
                  contributesToLicence: true,
                },
              ],
              id: 1,
              text: 'some text',
              uploadSummary: [
                {
                  description: 'Some words',
                  id: 1,
                  fileSize: 0,
                  uploadedTime: '',
                },
              ],
            },
          ],
          multipleItemConditions: [],
          exclusionZoneMapData: [
            {
              dataValue: {
                field: 'outOfBoundArea',
                contributesToLicence: true,
                id: 0,
                sequence: 0,
              },
              description: 'Some words',
              mapData: 'base64 data',
              text: 'some text',
            },
          ],
          restrictionZoneMapData: [],
          hdcLicenceData: null,
          isV4OrGreater: false,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of an AP licence with two exclusion zones and a restriction zone', async () => {
      res.locals.licence.additionalLicenceConditions = [
        {
          id: 1,
          code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
          text: 'some text',
          uploadSummary: [{ id: 1, description: 'Some words', fileSize: 0, uploadedTime: '' }],
          data: [{ field: 'outOfBoundArea', id: 0, sequence: 0, contributesToLicence: true }],
        },
        {
          id: 2,
          code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
          text: 'some text',
          uploadSummary: [{ id: 2, description: 'Some more words', fileSize: 0, uploadedTime: '' }],
          data: [{ field: 'outOfBoundArea', id: 0, sequence: 0, contributesToLicence: true }],
        },
        {
          id: 3,
          code: '005d70e4-a247-4f82-b8b3-6d294a0f5051',
          text: 'this is a restriction',
          uploadSummary: [{ id: 3, description: 'Some words about a restriction', fileSize: 0, uploadedTime: '' }],
          data: [{ field: 'outOfBoundArea', id: 0, sequence: 0, contributesToLicence: true }],
        },
      ]

      res.locals.licence.version = '4.0'

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')
      licenceService.getExclusionZoneImageData.mockResolvedValue('base64 data')

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/AP',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [
            {
              code: '005d70e4-a247-4f82-b8b3-6d294a0f5051',
              data: [
                {
                  contributesToLicence: true,
                  field: 'outOfBoundArea',
                  id: 0,
                  sequence: 0,
                },
              ],
              id: 3,
              text: 'this is a restriction',
              uploadSummary: [
                {
                  description: 'Some words about a restriction',
                  fileSize: 0,
                  id: 3,
                  uploadedTime: '',
                },
              ],
            },
          ],
          multipleItemConditions: [
            [
              {
                code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
                data: [
                  {
                    field: 'outOfBoundArea',
                    id: 0,
                    sequence: 0,
                    contributesToLicence: true,
                  },
                ],
                id: 1,
                text: 'some text',
                uploadSummary: [
                  {
                    description: 'Some words',
                    id: 1,
                    fileSize: 0,
                    uploadedTime: '',
                  },
                ],
              },
              {
                code: '0f9a20f4-35c7-4c77-8af8-f200f153fa11',
                data: [
                  {
                    field: 'outOfBoundArea',
                    id: 0,
                    sequence: 0,
                    contributesToLicence: true,
                  },
                ],
                id: 2,
                text: 'some text',
                uploadSummary: [
                  {
                    description: 'Some more words',
                    id: 2,
                    fileSize: 0,
                    uploadedTime: '',
                  },
                ],
              },
            ],
          ],
          exclusionZoneMapData: [
            {
              dataValue: {
                field: 'outOfBoundArea',
                contributesToLicence: true,
                id: 0,
                sequence: 0,
              },
              description: 'Some words',
              mapData: 'base64 data',
              text: 'some text',
            },
            {
              dataValue: {
                field: 'outOfBoundArea',
                contributesToLicence: true,
                id: 0,
                sequence: 0,
              },
              description: 'Some more words',
              mapData: 'base64 data',
              text: 'some text',
            },
          ],
          restrictionZoneMapData: [
            {
              dataValue: {
                contributesToLicence: true,
                field: 'outOfBoundArea',
                id: 0,
                sequence: 0,
              },
              description: 'Some words about a restriction',
              mapData: 'base64 data',
              text: 'this is a restriction',
            },
          ],
          hdcLicenceData: null,
          isV4OrGreater: true,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of an AP licence with a QR code', async () => {
      res.locals.licence.typeCode = 'AP'
      res.locals.qrCodesEnabled = true

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/AP',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: 'a QR code',
          htmlPrint: false,
          watermark,
          singleItemConditions: [],
          multipleItemConditions: [],
          exclusionZoneMapData: [],
          restrictionZoneMapData: [],
          hdcLicenceData: null,
          isV4OrGreater: false,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).toHaveBeenCalled()
    })

    it('should render a HTML view of a HDC AP licence', async () => {
      res.locals.licence.kind = 'HDC'
      res.locals.licence.typeCode = 'AP'

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/HDC_AP', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        restrictionZoneMapData: [],
        hdcLicenceData: exampleHdcLicenceData,
        isV4OrGreater: false,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of a HDC AP licence', async () => {
      res.locals.licence.kind = 'HDC'
      res.locals.licence.typeCode = 'AP'

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/HDC_AP',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [],
          multipleItemConditions: [],
          exclusionZoneMapData: [],
          restrictionZoneMapData: [],
          hdcLicenceData: exampleHdcLicenceData,
          isV4OrGreater: false,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
      expect(footerHtml).toMatch(/Version No:.+1.4/)
    })

    it('should render a HTML view of a HDC AP_PSS licence', async () => {
      res.locals.licence.kind = 'HDC'
      res.locals.licence.typeCode = 'AP_PSS'

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/HDC_AP_PSS', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        restrictionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: exampleHdcLicenceData,
        isV4OrGreater: false,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of a HDC AP_PSS licence', async () => {
      res.locals.licence.kind = 'HDC'
      res.locals.licence.typeCode = 'AP_PSS'

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/HDC_AP_PSS',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [],
          multipleItemConditions: [],
          exclusionZoneMapData: [],
          restrictionZoneMapData: [],
          hdcLicenceData: exampleHdcLicenceData,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
          isV4OrGreater: false,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
      expect(footerHtml).toMatch(/Version No:.+1.4/)
    })

    it('should render a HTML view of a HDC AP_PSS Variation licence', async () => {
      res.locals.licence.kind = 'HDC_VARIATION'
      res.locals.licence.typeCode = 'AP_PSS'

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/HDC_AP_PSS', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        restrictionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: exampleHdcLicenceData,
        isV4OrGreater: false,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of a HDC AP_PSS variation licence', async () => {
      res.locals.licence.kind = 'HDC_VARIATION'
      res.locals.licence.typeCode = 'AP_PSS'

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg
      const { monitoringSupplierTelephone } = config

      const filename = `${res.locals.licence.nomsId}.pdf`
      const footerHtml = handler.getPdfFooter(res.locals.licence)

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/HDC_AP_PSS',
        {
          licencesUrl,
          imageData: '-- base64 image data --',
          qrCode: null,
          htmlPrint: false,
          watermark,
          singleItemConditions: [],
          multipleItemConditions: [],
          exclusionZoneMapData: [],
          restrictionZoneMapData: [],
          hdcLicenceData: exampleHdcLicenceData,
          isV4OrGreater: false,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
      expect(footerHtml).toMatch(/Version No:.+1.4/)
    })
  })

  describe('getTemplateForLicenceType', () => {
    it('returns typeCode for CRD licences', () => {
      const licence = { kind: 'CRD', typeCode: 'AP' } as Licence
      expect(handler.getTemplateForLicence(licence)).toBe('AP')
    })

    it('returns typeCode for HARD_STOP licences', () => {
      const licence = { kind: 'HARD_STOP', typeCode: 'PSS' } as Licence
      expect(handler.getTemplateForLicence(licence)).toBe('PSS')
    })

    it('returns typeCode for VARIATION licences', () => {
      const licence = { kind: 'VARIATION', typeCode: 'AP_PSS' } as Licence
      expect(handler.getTemplateForLicence(licence)).toBe('AP_PSS')
    })

    it('adds an HDC prefix to typeCode for HDC licences', () => {
      const licence = { kind: 'HDC', typeCode: 'AP' } as Licence
      expect(handler.getTemplateForLicence(licence)).toBe('HDC_AP')
    })

    it('adds an HDC prefix to typeCode for HDC variation licences', () => {
      const licence = { kind: 'HDC_VARIATION', typeCode: 'AP_PSS' } as Licence
      expect(handler.getTemplateForLicence(licence)).toBe('HDC_AP_PSS')
    })
  })
})
