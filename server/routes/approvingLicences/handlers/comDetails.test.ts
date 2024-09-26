import { Request, Response } from 'express'

import ComDetailsRoutes from './comDetails'
import ProbationService from '../../../services/probationService'
import { DeliusStaff } from '../../../@types/deliusClientTypes'

const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>

describe('Route Handlers - COM Details', () => {
  const handler = new ComDetailsRoutes(probationService)
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

    probationService.getStaffDetailByUsername = jest.fn()
  })

  describe('GET', () => {
    it('should render com details view', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        name: {
          forename: 'Joe',
          surname: 'Rogan',
        },
        telephoneNumber: '07892387162',
        email: 'jrogan@probation.gov.uk',
      } as DeliusStaff)

      await handler.GET(req, res)
      expect(probationService.getStaffDetailByUsername).toHaveBeenCalledWith('jrogan')
      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/approve/cases',
        name: 'Joe Rogan',
        telephone: '07892387162',
        email: 'jrogan@probation.gov.uk',
      })
    })
  })
})
