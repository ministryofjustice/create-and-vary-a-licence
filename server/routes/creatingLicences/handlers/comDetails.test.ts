import { Request, Response } from 'express'
import CommunityService from '../../../services/communityService'
import ComDetailsRoutes from './comDetails'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>

jest.mock('../../../services/communityService')

describe('Route Handlers - Create Licence - Com Details', () => {
  const handler = new ComDetailsRoutes(communityService)
  let req: Request
  let res: Response

  describe('GET', () => {
    beforeEach(() => {
      req = {
        params: {
          staffCode: 'X12345',
        },
      } as unknown as Request

      res = {
        redirect: jest.fn(),
        render: jest.fn(),
        locals: {
          user: {
            probationTeamCodes: ['teamA'],
          },
        },
      } as unknown as Response
    })

    it('should deny page load if requested staff is not in same team as user', async () => {
      communityService.getStaffDetailByStaffCode.mockResolvedValue({
        teams: [
          {
            code: 'teamB',
          },
        ],
      })

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should load page and display staff details of requested staff member', async () => {
      communityService.getStaffDetailByStaffCode.mockResolvedValue({
        teams: [
          {
            code: 'teamA',
          },
        ],
        staff: {
          forenames: 'Joe',
          surname: 'Rogan',
        },
        telephoneNumber: '07892486128',
        email: 'jrogan@probation.gov.uk',
      })

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/create/caseload',
        name: 'Joe Rogan',
        telephone: '07892486128',
        email: 'jrogan@probation.gov.uk',
      })
    })
  })
})
