import { Request, Response } from 'express'

import ComDetailsRoutes from './comDetails'
import CommunityService from '../../../services/communityService'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/communityService')

describe('Route Handlers - COM Details', () => {
  const handler = new ComDetailsRoutes(communityService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        staffCode: 'X12345',
      },
    } as unknown as Request
    res = {
      render: jest.fn(),
      locals: {},
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render com details view', async () => {
      communityService.getStaffDetailByStaffCode.mockResolvedValue({
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
        telephoneNumber: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      })

      await handler.GET(req, res)
      expect(communityService.getStaffDetailByStaffCode).toHaveBeenCalledWith('X12345')
      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/view/cases',
        name: 'Joe Bloggs',
        telephone: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      })
    })

    it('should render correct back link', async () => {
      req = {
        params: {
          staffCode: 'X12345',
        },
        query: {
          activeTab: 'future-releases',
        },
      } as unknown as Request
      communityService.getStaffDetailByStaffCode.mockResolvedValue({
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
        telephoneNumber: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      })

      await handler.GET(req, res)
      expect(communityService.getStaffDetailByStaffCode).toHaveBeenCalledWith('X12345')
      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/view/cases#future-releases',
        name: 'Joe Bloggs',
        telephone: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      })
    })
  })
})
