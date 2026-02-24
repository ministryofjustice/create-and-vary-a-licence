import fs from 'fs'
import { Request, Response } from 'express'
import DoHdcCurfewHoursApplyDailyRoutes from './doHdcCurfewHoursApplyDaily'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/hdc/doHdcCurfewHoursApplyDaily.njk').toString())

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
        licence: {},
      },
    } as unknown as Response
  })

  const handler = new DoHdcCurfewHoursApplyDailyRoutes()

  describe('GET', () => {
    it('should render view', async () => {
      req.query = { edit: 'telNumber' }
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/hdc/doHdcCurfewHoursApplyDaily')
    })
  })

  describe('View', () => {
    it('should display the question', () => {
      const $ = render({})
      expect($('legend').text().trim()).toBe('Do the same HDC curfew hours apply every day?')
    })
  })

  describe('POST', () => {
    it('should redirect to the do hdc curfew hours apply daily page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/hdc/do-hdc-curfew-hours-apply-daily')
    })
  })
})
