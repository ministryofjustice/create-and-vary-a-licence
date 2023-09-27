import { Request, Response } from 'express'

import PrintLicenceRoutes from './printLicence'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import LicenceService from '../../../services/licenceService'
import config from '../../../config'

const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
const qrCodeService = new QrCodeService() as jest.Mocked<QrCodeService>
const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>

const username = 'joebloggs'

describe('Route - print a licence', () => {
  const handler = new PrintLicenceRoutes(prisonerService, qrCodeService, licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetAllMocks()
    req = {} as unknown as Request
    prisonerService.getPrisonerImageData = jest.fn()
    qrCodeService.getQrCode = jest.fn()
    licenceService.getExclusionZoneImageData = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
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
        additionalConditions: [],
        additionalConditionsWithUploads: [],
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
        additionalConditions: [],
        additionalConditionsWithUploads: [],
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
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            licenceVersion: '1.4',
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg

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
          additionalConditions: [],
          additionalConditionsWithUploads: [],
          exclusionZoneMapData: [],
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
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
            licenceVersion: '1.0',
            additionalLicenceConditions,
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg

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
          additionalConditions: [],
          additionalConditionsWithUploads: [
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
          exclusionZoneMapData: [
            {
              dataValue: {
                field: 'outOfBoundArea',
              },
              description: 'Some words',
              mapData: 'base64 data',
            },
          ],
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
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
            additionalLicenceConditions: [],
            additionalPssConditions: [],
            licenceVersion: '1.0',
          },
          qrCodesEnabled: true,
        },
      } as unknown as Response

      const { licencesUrl, pdfOptions, watermark } = config.apis.gotenberg

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
          additionalConditions: [],
          additionalConditionsWithUploads: [],
          exclusionZoneMapData: [],
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
      )

      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
      expect(qrCodeService.getQrCode).toHaveBeenCalled()
    })
  })
})
