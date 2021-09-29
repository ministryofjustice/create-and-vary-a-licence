import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'
import { CommunityApiManagedOffender } from '../../../data/communityClientTypes'

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>
const communityService = new CommunityService(null) as jest.Mocked<CommunityService>

jest.mock('../../../services/licenceService')
jest.mock('../../../services/communityService')

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes(licenceService, communityService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {} as Request

    res = {
      render: jest.fn(),
    } as unknown as Response

    communityService.getManagedOffenders.mockResolvedValue([
      {
        offenderSurname: 'Balasaravika',
        crnNumber: 'X381306',
      } as unknown as CommunityApiManagedOffender,
    ])
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Balasaravika',
            crnNumber: 'X381306',
            conditionalReleaseDate: '03 August 2022',
          },
        ],
      })
    })
  })
})
