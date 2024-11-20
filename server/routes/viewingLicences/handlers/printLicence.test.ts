import { Request, Response } from 'express'

import PrintLicenceRoutes from './printLicence'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import config from '../../../config'
import HdcService from '../../../services/hdcService'
import { HdcLicenceData } from '../../../@types/licenceApiClientTypes'

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
      addressLine1: 'addressLineOne',
      addressLine2: 'addressLineTwo',
      addressTown: 'addressTownOrCity',
      postCode: 'addressPostcode',
    },
    firstNightCurfewHours: {
      firstNightFrom: '09:00',
      firstNightUntil: '17:00',
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
  } as HdcLicenceData

  beforeEach(() => {
    jest.resetAllMocks()
    req = {} as unknown as Request
    prisonerService.getPrisonerImageData = jest.fn()
    qrCodeService.getQrCode = jest.fn()
    licenceService.getExclusionZoneImageData = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    hdcService.getHdcLicenceData = jest.fn()
  })

  describe('GET', () => {
    it('should render a HTML view of an AP licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            typeCode: 'AP',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      qrCodeService.getQrCode.mockResolvedValue('a QR code')

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/AP', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a HTML view of a PSS licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            typeCode: 'PSS',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      qrCodeService.getQrCode.mockResolvedValue('a QR code')

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/PSS', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: null,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of an AP licence', async () => {
      res = {
        render: jest.fn(),
        renderPDF: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: '1',
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
          hdcLicenceData: null,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
      expect(footerHtml).toMatch(/Version No:.+1.4/)
    })

    it('should strip the minor version number off a varied licence', async () => {
      res = {
        locals: {
          licence: {
            id: 1,
            typeCode: 'AP',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            licenceVersion: '3.0',
          },
        },
      } as unknown as Response

      const footerHtml = handler.getPdfFooter(res.locals.licence)
      expect(footerHtml).toMatch(/Version No:.+<\/span>/)
    })

    it('should render a PDF view of an AP licence with exclusion zone data', async () => {
      const additionalLicenceConditions = [
        {
          id: 1,
          code: 'code',
          uploadSummary: [{ id: 1, description: 'Some words' }],
          data: [{ field: 'outOfBoundArea' }, { value: 'London' }],
        },
      ]

      res = {
        render: jest.fn(),
        renderPDF: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: '1',
            typeCode: 'AP',
            nomsId: 'A1234AA',
            lastName: 'Bloggs',
            cro: 'CRO',
            bookingNo: 'BOOKING',
            pnc: 'PNC',
            version: '1.0',
            prisonCode: 'MDI',
            prisonTelephone: '0114 2345232334',
            licenceVersion: '1.0',
            additionalLicenceConditions,
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

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
              code: 'code',
              data: [
                {
                  field: 'outOfBoundArea',
                },
                {
                  value: 'London',
                },
              ],
              id: 1,
              uploadSummary: [
                {
                  description: 'Some words',
                  id: 1,
                },
              ],
            },
          ],
          multipleItemConditions: [],
          exclusionZoneMapData: [
            {
              dataValue: {
                field: 'outOfBoundArea',
              },
              description: 'Some words',
              mapData: 'base64 data',
            },
          ],
          hdcLicenceData: null,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of an AP licence with a QR code', async () => {
      res = {
        render: jest.fn(),
        renderPDF: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: '1',
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
            licenceVersion: '1.0',
          },
          qrCodesEnabled: true,
        },
      } as unknown as Response

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
          hdcLicenceData: null,
          prisonTelephone: '0114 2345232334',
          monitoringSupplierTelephone,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } },
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).toHaveBeenCalled()
    })

    it('should render a HTML view of a HDC AP licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            kind: 'HDC',
            typeCode: 'AP',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/HDC_AP', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: exampleHdcLicenceData,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of a HDC AP licence', async () => {
      res = {
        render: jest.fn(),
        renderPDF: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: '1',
            kind: 'HDC',
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
          hdcLicenceData: exampleHdcLicenceData,
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
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: 1,
            kind: 'HDC',
            typeCode: 'AP_PSS',
            additionalLicenceConditions: [],
            additionalPssConditions: [],
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      qrCodeService.getQrCode.mockResolvedValue('a QR code')
      hdcService.getHdcLicenceData.mockResolvedValue(exampleHdcLicenceData)

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/HDC_AP_PSS', {
        qrCode: null,
        htmlPrint: true,
        exclusionZoneMapData: [],
        singleItemConditions: [],
        multipleItemConditions: [],
        hdcLicenceData: exampleHdcLicenceData,
      })
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(hdcService.getHdcLicenceData).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).not.toHaveBeenCalled()
    })

    it('should render a PDF view of a HDC AP_PSS licence', async () => {
      res = {
        render: jest.fn(),
        renderPDF: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            id: '1',
            kind: 'HDC',
            typeCode: 'AP_PSS',
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
          hdcLicenceData: exampleHdcLicenceData,
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
})
