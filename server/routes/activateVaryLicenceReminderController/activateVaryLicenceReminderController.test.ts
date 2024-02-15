import { Request, Response } from 'express'
import ActivateVaryLicenceReminderController from './activateVaryLicenceReminderController'

describe('Activate vary licence reminder page', () => {
  const handler = new ActivateVaryLicenceReminderController()
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render activate vary licence reminder page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/activateVaryLicenceReminderPage', {})
    })
  })
})
