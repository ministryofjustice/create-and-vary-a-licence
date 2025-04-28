import { Request, Response } from 'express'

import ConfirmApprovedRoutes from './confirmApproved'
import ProbationService from '../../../services/probationService'
import { DeliusStaff } from '../../../@types/deliusClientTypes'

const probationService = new ProbationService(null, null) as jest.Mocked<ProbationService>
jest.mock('../../../services/probationService')
describe('Route - approve licence', () => {
  const handler = new ConfirmApprovedRoutes(probationService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        licence: {
          forename: 'Joe',
          surname: 'Bloggs',
          typeCode: 'PSS',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render confirmation page for AP with isComEmailAvailable true', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        id: 3000,
        username: 'joebloggs',
        email: 'joebloggs@probation.gov.uk',
        telephoneNumber: '07777777777',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      } as DeliusStaff)
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage: 'A case administrator can now print the licence for Joe Bloggs.',
        isComEmailAvailable: true,
      })
    })

    it('should render confirmation page for AP with isComEmailAvailable false', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        id: 3000,
        username: 'joebloggs',
        telephoneNumber: '07777777777',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      } as DeliusStaff)
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage: 'A case administrator can now print the licence for Joe Bloggs.',
        isComEmailAvailable: false,
      })
    })

    it('should render confirmation page for AP_PSS with isComEmailAvailable true', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        id: 3000,
        username: 'joebloggs',
        email: 'joebloggs@probation.gov.uk',
        telephoneNumber: '07777777777',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      } as DeliusStaff)
      res.locals.licence.typeCode = 'AP_PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence and post sentence supervision order approved',
        confirmationMessage:
          'A case administrator can now print the licence and post sentence supervision order for Joe Bloggs.',
        isComEmailAvailable: true,
      })
    })

    it('should render confirmation page for AP_PSS with isComEmailAvailable false', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        id: 3000,
        username: 'joebloggs',
        telephoneNumber: '07777777777',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      } as DeliusStaff)
      res.locals.licence.typeCode = 'AP_PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence and post sentence supervision order approved',
        confirmationMessage:
          'A case administrator can now print the licence and post sentence supervision order for Joe Bloggs.',
        isComEmailAvailable: false,
      })
    })

    it('should render confirmation page for PSS with isComEmailAvailable true', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        id: 3000,
        username: 'joebloggs',
        email: 'joebloggs@probation.gov.uk',
        telephoneNumber: '07777777777',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      } as DeliusStaff)
      res.locals.licence.typeCode = 'PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Post sentence supervision order approved',
        confirmationMessage: 'A case administrator can now print the post sentence supervision order for Joe Bloggs.',
        isComEmailAvailable: true,
      })
    })

    it('should render confirmation page for PSS with isComEmailAvailable false', async () => {
      probationService.getStaffDetailByUsername.mockResolvedValue({
        id: 3000,
        username: 'joebloggs',
        telephoneNumber: '07777777777',
        name: {
          forename: 'Joe',
          surname: 'Bloggs',
        },
      } as DeliusStaff)
      res.locals.licence.typeCode = 'PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Post sentence supervision order approved',
        confirmationMessage: 'A case administrator can now print the post sentence supervision order for Joe Bloggs.',
        isComEmailAvailable: false,
      })
    })
  })
})
