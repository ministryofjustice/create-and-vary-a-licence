import { Request, Response } from 'express'

import AccessRestrictedDelius from './accessRestrictedDelius'
import { CaseAccessDetails } from '../../../@types/licenceApiClientTypes'
import LicenceService from '../../../services/licenceService'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

jest.mock('../../../services/licenceService')

const crn = 'crn1234'
const caseAccessDetails = { crn, type: 'RESTRICTED', message: 'a message' } as CaseAccessDetails

describe('Route Handlers - Access restricted Delius', () => {
  const handler = new AccessRestrictedDelius(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        crn,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'user',
        },
      },
    } as unknown as Response

    licenceService.checkComCaseAccess.mockResolvedValue(caseAccessDetails)
  })

  describe('GET', () => {
    it('Should render the access restricted on Delius view', async () => {
      await handler.GET(req, res)

      expect(licenceService.checkComCaseAccess).toHaveBeenCalledWith({ crn }, res.locals.user)
      expect(res.render).toHaveBeenCalledWith('pages/accessRestrictedDelius', { caseAccessDetails })
    })
  })
})
