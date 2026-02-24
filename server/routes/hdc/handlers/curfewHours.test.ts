import { Request, Response } from 'express'
import CurfewHoursRoutes from './curfewHours'
import HdcService from '../../../services/hdcService'

const hdcService = new HdcService(null) as jest.Mocked<HdcService>
jest.mock('../../../services/hdcService')

describe('Route Handlers - Create Licence - Do HDC Curfew Hours Apply Daily', () => {
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      body: {},
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          id: 1,
        },
      },
    } as unknown as Response
  })

  const handler = new CurfewHoursRoutes(hdcService)

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/curfewHours')
    })
  })

  describe('POST', () => {
    it('should update curfew times when clicked continue', async () => {
      req.body = {
        curfewStart: { hour: '05', minute: '00', ampm: 'pm' },
        curfewEnd: { hour: '10', minute: '30', ampm: 'am' },
      }
      await handler.POST(req, res)
      expect(hdcService.updateCurfewTimes).toHaveBeenCalledWith(
        1,
        { curfewStart: req.body.curfewStart, curfewEnd: req.body.curfewEnd },
        res.locals.user,
      )
    })
  })
})
