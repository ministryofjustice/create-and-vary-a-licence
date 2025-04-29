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
        telephoneNumber: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      } as DeliusStaff)

      await handler.GET(req, res)
      expect(probationService.getStaffDetailByStaffCode).toHaveBeenCalledWith('X12345')
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
      probationService.getStaffDetailByStaffCode.mockResolvedValue({
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
        telephoneNumber: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      } as DeliusStaff)

      await handler.GET(req, res)
      expect(probationService.getStaffDetailByStaffCode).toHaveBeenCalledWith('X12345')
      expect(res.render).toHaveBeenCalledWith('pages/comDetails', {
        returnLink: '/licence/view/cases#future-releases',
        name: 'Joe Bloggs',
        telephone: '07892387162',
        email: 'joebloggs@probation.gov.uk',
      })
    })
  })
})
