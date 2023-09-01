import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import AdditionalLicenceTypesHandler from './additionalLicenceTypesHandler'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
describe('Route Handlers - Create Licence - Additional Licence Types Handler', () => {
  const handler = new AdditionalLicenceTypesHandler(licenceService)
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
    })
  })
})
