import { Request, Response } from 'express'

import PrintLicenceRoutes from './printLicence'
import PrisonerService from '../../../services/prisonerService'
import QrCodeService from '../../../services/qrCodeService'
import config from '../../../config'

const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>
const qrCodeService = new QrCodeService() as jest.Mocked<QrCodeService>

const username = 'joebloggs'

describe('Route - print a licence', () => {
  const handler = new PrintLicenceRoutes(prisonerService, qrCodeService)
  let req: Request
  let res: Response

  beforeEach(() => {
    jest.resetModules()
    req = {} as unknown as Request
    prisonerService.getPrisonerImageData = jest.fn()
    qrCodeService.getQrCode = jest.fn()
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
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      qrCodeService.getQrCode.mockResolvedValue('a QR code')

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/AP', {
        additionalLicenceConditions: [],
        additionalPssConditions: [],
        qrCodesEnabled: false,
        qrCode: null,
        htmlPrint: true,
      })

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
          },
          qrCodesEnabled: false,
        },
      } as unknown as Response

      qrCodeService.getQrCode.mockResolvedValue('a QR code')

      await handler.preview(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/licence/PSS', {
        additionalLicenceConditions: [],
        additionalPssConditions: [],
        qrCodesEnabled: false,
        qrCode: null,
        htmlPrint: true,
      })

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
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          qrCodesEnabled: false,
          qrCode: null,
          htmlPrint: false,
          watermark,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
      )

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
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          qrCodesEnabled: true,
          qrCode: 'a QR code',
          htmlPrint: false,
          watermark,
        },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
      )

      expect(qrCodeService.getQrCode).toHaveBeenCalled()
    })
  })
})
