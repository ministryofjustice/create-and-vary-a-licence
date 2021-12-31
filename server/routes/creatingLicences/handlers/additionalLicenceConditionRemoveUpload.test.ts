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
          additionalLicenceConditions: [],
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response

    licenceService.removeExclusionZoneFile = jest.fn()
  })

  it('should remove the file upload for a condition', async () => {
    await handler.GET(req, res)
    expect(licenceService.removeExclusionZoneFile).toHaveBeenCalledWith('2', '2', { username: 'joebloggs' } as User)
    expect(res.redirect).toHaveBeenCalledWith('back')
  })
})
