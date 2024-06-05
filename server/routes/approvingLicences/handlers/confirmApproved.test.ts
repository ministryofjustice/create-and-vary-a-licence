import { Request, Response } from 'express'

import ConfirmApprovedRoutes from './confirmApproved'
import CommunityService from '../../../services/communityService'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/communityService')
describe('Route - approve licence', () => {
  const handler = new ConfirmApprovedRoutes(communityService)
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
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staffIdentifier: 3000,
        username: 'joebloggs',
        email: 'joebloggs@probation.gov.uk',
        telephoneNumber: '07777777777',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      })
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage: 'A case administrator can now print the licence for Joe Bloggs.',
        isComEmailAvailable: true,
      })
    })

    it('should render confirmation page for AP with isComEmailAvailable false', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staffIdentifier: 3000,
        username: 'joebloggs',
        telephoneNumber: '07777777777',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      })
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage: 'A case administrator can now print the licence for Joe Bloggs.',
        isComEmailAvailable: false,
      })
    })

    it('should render confirmation page for AP_PSS with isComEmailAvailable true', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staffIdentifier: 3000,
        username: 'joebloggs',
        email: 'joebloggs@probation.gov.uk',
        telephoneNumber: '07777777777',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      })
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
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staffIdentifier: 3000,
        username: 'joebloggs',
        telephoneNumber: '07777777777',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      })
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
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staffIdentifier: 3000,
        username: 'joebloggs',
        email: 'joebloggs@probation.gov.uk',
        telephoneNumber: '07777777777',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      })
      res.locals.licence.typeCode = 'PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Post sentence supervision order approved',
        confirmationMessage: 'A case administrator can now print the post sentence supervision order for Joe Bloggs.',
        isComEmailAvailable: true,
      })
    })

    it('should render confirmation page for PSS with isComEmailAvailable false', async () => {
      communityService.getStaffDetailByUsername.mockResolvedValue({
        staffIdentifier: 3000,
        username: 'joebloggs',
        telephoneNumber: '07777777777',
        staff: {
          forenames: 'Joe',
          surname: 'Bloggs',
        },
      })
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
