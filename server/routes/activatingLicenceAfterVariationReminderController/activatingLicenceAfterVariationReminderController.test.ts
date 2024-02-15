import { Request, Response } from 'express'
import ActivatingLicenceAfterVariationReminderController from './activatingLicenceAfterVariationReminderController'

describe('Activating licence after variation reminder page', () => {
  const handler = new ActivatingLicenceAfterVariationReminderController()
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render activating licence after variation reminder page', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/activatingLicenceAfterVariationReminderPage', {})
    })
  })
})
