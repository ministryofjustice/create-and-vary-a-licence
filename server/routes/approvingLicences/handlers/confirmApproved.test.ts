import { Request, Response } from 'express'

import ConfirmApprovedRoutes from './confirmApproved'
import CommunityService from '../../../services/communityService'
import config from '../../../config'

const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
jest.mock('../../../services/communityService')
describe('Route - approve licence', () => {
  const handler = new ConfirmApprovedRoutes(communityService)
  const existingConfig = config
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

  beforeAll(() => {
    config.hardStopEnabled = true
  })

  afterAll(() => {
    config.hardStopEnabled = existingConfig.hardStopEnabled
  })

  describe('GET', () => {
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

    it('should render confirmation page for AP', async () => {
      config.hardStopEnabled = false
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage: 'A case administrator can now print the licence for Joe Bloggs.',
      })
    })
    it('should render confirmation page for AP and email PP', async () => {
      config.hardStopEnabled = true
      res.locals.licence.typeCode = 'AP'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence approved',
        confirmationMessage:
          'A case administrator can now print the licence for Joe Bloggs.\nWe will email the probation practitioner automatically to tell them this licence has been approved.',
      })
    })

    it('should render confirmation page for AP and notify PP manually', async () => {
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
        confirmationMessage:
          'A case administrator can now print the licence for Joe Bloggs.\nA case administrator still needs to notify the probation team that this licence has been approved. We do not have their contact details to do this automatically.',
      })
    })

    it('should render confirmation page for AP_PSS', async () => {
      config.hardStopEnabled = false
      res.locals.licence.typeCode = 'AP_PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Licence and post sentence supervision order approved',
        confirmationMessage:
          'A case administrator can now print the licence and post sentence supervision order for Joe Bloggs.',
      })
    })

    it('should render confirmation page for AP_PSS and email PP', async () => {
      config.hardStopEnabled = true
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
          'A case administrator can now print the licence and post sentence supervision order for Joe Bloggs.\nWe will email the probation practitioner automatically to tell them this licence has been approved.',
      })
    })

    it('should render confirmation page for AP_PSS and notify PP manually', async () => {
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
          'A case administrator can now print the licence and post sentence supervision order for Joe Bloggs.\nA case administrator still needs to notify the probation team that this licence has been approved. We do not have their contact details to do this automatically.',
      })
    })

    it('should render confirmation page for PSS', async () => {
      config.hardStopEnabled = false
      res.locals.licence.typeCode = 'PSS'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/approve/confirmation', {
        titleText: 'Post sentence supervision order approved',
        confirmationMessage: 'A case administrator can now print the post sentence supervision order for Joe Bloggs.',
      })
    })

    it('should render confirmation page for PSS and email PP', async () => {
      config.hardStopEnabled = true
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
        confirmationMessage:
          'A case administrator can now print the post sentence supervision order for Joe Bloggs.\nWe will email the probation practitioner automatically to tell them this licence has been approved.',
      })
    })

    it('should render confirmation page for PSS and notify PP manually', async () => {
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
        confirmationMessage:
          'A case administrator can now print the post sentence supervision order for Joe Bloggs.\nA case administrator still needs to notify the probation team that this licence has been approved. We do not have their contact details to do this automatically.',
      })
    })
  })
})
