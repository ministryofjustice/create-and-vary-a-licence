import { Request, Response } from 'express'
import ProbationService from '../../../services/probationService'
import ComDetailsRoutes from './comDetails'
import { DeliusStaff } from '../../../@types/deliusClientTypes'

const deliusService = new ProbationService(null) as jest.Mocked<ProbationService>

jest.mock('../../../services/probationService')

describe('Route Handlers - Create Licence - Com Details', () => {
  const handler = new ComDetailsRoutes(deliusService)
  let req: Request
  let res: Response

  describe('GET', () => {
    beforeEach(() => {
      req = {
        params: {
          staffCode: 'X12345',
        },
        session: {
          returnToCase: '/licence/create/caseload',
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
      deliusService.getStaffDetailByStaffCode.mockResolvedValue({ teams: [{ code: 'teamB' }] } as DeliusStaff)

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should load page and display staff details of requested staff member', async () => {
      deliusService.getStaffDetailByStaffCode.mockResolvedValue({
        teams: [{ code: 'teamA' }],
        name: {
          forename: 'Joe',
          surname: 'Rogan',
        },
        telephoneNumber: '07892486128',
        email: 'jrogan@probation.gov.uk',
      } as DeliusStaff)

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: req.session.returnToCase,
        name: 'Joe Rogan',
        telephone: '07892486128',
        email: 'jrogan@probation.gov.uk',
      })
    })
  })
})
