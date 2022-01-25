import { Request, Response } from 'express'

import ComDetailsRoutes from './comDetails'
import CommunityService from '../../../services/communityService'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>

describe('Route Handlers - COM Details', () => {
  const handler = new ComDetailsRoutes(communityService)
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
      locals: {
        licence: {
          comUsername: 'jrogan',
        },
      },
    } as unknown as Response

    communityService.getStaffDetailByUsername = jest.fn()
  })

  describe('GET', () => {
    it('should render com details view', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staff: {
          forenames: 'Joe',
          surname: 'Rogan',
        },
        telephoneNumber: '07892387162',
        email: 'jrogan@probation.gov.uk',
      })

      await handler.GET(req, res)
      expect(communityService.getStaffDetailByUsername).toHaveBeenCalledWith('jrogan')
      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/view/cases',
        name: 'Joe Rogan',
        telephone: '07892387162',
        email: 'jrogan@probation.gov.uk',
      })
    })
  })
})
