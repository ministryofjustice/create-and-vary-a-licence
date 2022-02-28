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
          comUsername: 'smills',
        },
      },
    } as unknown as Response

    communityService.getStaffDetailByUsername = jest.fn()
  })

  describe('GET', () => {
    it('should render com details view', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staff: {
          forenames: 'Stephen',
          surname: 'Mills',
        },
        telephoneNumber: '07892387162',
        email: 'smills@probation.gov.uk',
      })

      await handler.GET(req, res)

      expect(communityService.getStaffDetailByUsername).toHaveBeenCalledWith('smills')
      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/vary-approve/list',
        name: 'Stephen Mills',
        telephone: '07892387162',
        email: 'smills@probation.gov.uk',
      })
    })
  })
})
