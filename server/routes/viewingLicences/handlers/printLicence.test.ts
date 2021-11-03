import { Request, Response } from 'express'

import PrintLicenceRoutes from './printLicence'
import PrisonerService from '../../../services/prisonerService'
import config from '../../../config'

const prisonerService = new PrisonerService(null) as jest.Mocked<PrisonerService>
const username = 'joebloggs'

describe('Route - print a licence', () => {
  const handler = new PrintLicenceRoutes(prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {} as unknown as Request
    prisonerService.getPrisonerImageData = jest.fn()
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
        },
      } as unknown as Response
      await handler.preview(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/licence/AP', { htmlPrint: true })
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
        },
      } as unknown as Response
      await handler.preview(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/licence/PSS', { htmlPrint: true })
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
        },
      } as unknown as Response

      const { licencesUrl, pdfOptions } = config.apis.gotenberg

      const filename = `${res.locals.licence.nomsId}.pdf`

      const footerHtml = handler.getPdfFooter(
        res.locals.licence.nomsId,
        res.locals.licence.cro,
        res.locals.licence.bookingNo,
        res.locals.licence.pnc,
        res.locals.licence.typeCode,
        res.locals.licence.id,
        res.locals.licence.version,
        res.locals.licence.prisonCode
      )

      prisonerService.getPrisonerImageData.mockResolvedValue('-- base64 image data --')

      await handler.renderPdf(req, res)

      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/AP',
        { licencesUrl, imageData: '-- base64 image data --', htmlPrint: false },
        { filename, pdfOptions: { headerHtml: null, footerHtml, ...pdfOptions } }
      )
    })
  })
})
