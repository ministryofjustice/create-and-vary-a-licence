import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import DeleteConditionsByCodeHandler from './deleteConditionsByCodeHandler'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
describe('Route Handlers - Create Licence - Delete Conditions By Code Handler Handler', () => {
  const handler = new DeleteConditionsByCodeHandler(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: { conditionCode: 'abc' },
    } as unknown as Request

    licenceService.deleteAdditionalConditionsByCode = jest.fn()

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          id: 123,
          additionalLicenceConditions: [
            { id: 1, code: 'abc' },
            { id: 2, code: 'abc' },
            { id: 3, code: 'cba' },
          ],
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('DELETE', () => {
    it('should remove all conditions on the licence which belong to the submitted code', async () => {
      await handler.DELETE(req, res)
      expect(licenceService.deleteAdditionalConditionsByCode).toHaveBeenCalledWith(
        'abc',
        {
          additionalLicenceConditions: [
            { id: 1, code: 'abc' },
            { id: 2, code: 'abc' },
            { id: 3, code: 'cba' },
          ],
        },
        { username: 'joebloggs' }
      )

      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/123/check-your-answers`)
    })
  })
})
