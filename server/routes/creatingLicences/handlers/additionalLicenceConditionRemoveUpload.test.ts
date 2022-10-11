import { Request, Response } from 'express'
import { User } from '../../../@types/CvlUserDetails'
import LicenceService from '../../../services/licenceService'
import AdditionalLicenceConditionRemoveUploadRoutes from './additionalLicenceConditionRemoveUpload'

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Remove file upload from condition', () => {
  const handler = new AdditionalLicenceConditionRemoveUploadRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '2',
        conditionId: '2',
      },
      query: {},
      body: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          id: '2',
          additionalLicenceConditions: [
            {
              id: 2,
              code: 'testcode',
              uploadSummary: [{}, {}],
            },
          ],
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    licenceService.deleteAdditionalCondition = jest.fn()
  })

  it('should remove the file upload for a condition', async () => {
    await handler.GET(req, res)
    expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(2, 2, { username: 'joebloggs' } as User)
    expect(res.redirect).toHaveBeenCalledWith(
      '/licence/create/id/2/additional-licence-conditions/condition/testcode/file-uploads'
    )
  })
})
