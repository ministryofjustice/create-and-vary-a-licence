/* eslint-disable  @typescript-eslint/no-explicit-any */
import PdfRoutes from './pdf'
import LicenceService from '../../../services/licenceService'

jest.mock('../../../services/licenceService')

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>

describe('Route Handlers - View Licence - PDF', () => {
  const handler = new PdfRoutes(licenceService)
  let req: any
  let res: any

  beforeEach(() => {
    req = {
      params: 'id',
    }

    res = {
      render: jest.fn(),
      renderPDF: jest.fn(),
      locals: {
        user: {
          username: 'user',
        },
      },
    }

    licenceService.getLicenceForPdf.mockReturnValue({
      nomsId: 123,
      lastName: 'Smith',
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('preview', () => {
    it('should render view with licence data and html', async () => {
      await handler.preview(req, res)
      expect(res.render).toHaveBeenCalledWith(
        'pages/licence/preview',
        expect.objectContaining({
          licence: {
            nomsId: 123,
            lastName: 'Smith',
          },
        })
      )
    })
  })

  describe('renderPdf', () => {
    it('should render PDF with licence data', async () => {
      await handler.renderPdf(req, res)
      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/preview',
        expect.objectContaining({
          licence: {
            nomsId: 123,
            lastName: 'Smith',
          },
        }),
        expect.any(Object)
      )
    })

    it('should render PDF with correct filename if nomsId present in licence', async () => {
      await handler.renderPdf(req, res)
      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/preview',
        expect.any(Object),
        expect.objectContaining({
          filename: '123.pdf',
        })
      )
    })

    it('should render PDF with correct filename if nomsId not present in licence', async () => {
      licenceService.getLicenceForPdf.mockReturnValue({
        lastName: 'Smith',
      })

      await handler.renderPdf(req, res)
      expect(res.renderPDF).toHaveBeenCalledWith(
        'pages/licence/preview',
        expect.any(Object),
        expect.objectContaining({
          filename: 'Smith.pdf',
        })
      )
    })
  })
})
