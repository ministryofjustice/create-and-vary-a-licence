import { Request, Response } from 'express'

import ComDetailsRoutes from './comDetails'
import ProbationService from '../../../services/probationService'
import { DeliusStaff } from '../../../@types/deliusClientTypes'

const probationService = new ProbationService(null) as jest.Mocked<ProbationService>
jest.mock('../../../services/probationService')

describe('Route Handlers - COM Details', () => {
  const handler = new ComDetailsRoutes(probationService)
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
      probationService.getStaffDetailByStaffCode.mockResolvedValue({
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
        code: 'X12345',
        telephoneNumber: '00000000000',
        email: 'joebloggs@probation.gov.uk',
      } as DeliusStaff)

      await handler.GET(req, res)
      expect(probationService.getStaffDetailByStaffCode).toHaveBeenCalledWith('X12345')
      expect(res.render).toHaveBeenCalledWith('pages/support/comDetails', {
        name: 'Joe Bloggs',
        telephone: '00000000000',
        staffCode: 'X12345',
        email: 'joebloggs@probation.gov.uk',
      })
    })
  })
})
