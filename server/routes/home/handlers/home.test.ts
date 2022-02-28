import { Request, Response } from 'express'

import HomeRoutes from './home'

describe('Route Handlers - Home', () => {
  const handler = new HomeRoutes()
  let req: Request
  let res: Response

  beforeEach(() => {
    res = {
      render: jest.fn(),
    } as unknown as Response
  })

  describe('GET', () => {
    it('For case admin', async () => {
      req = getReqWithRolesAndSource(['ROLE_LICENCE_CA'], 'nomis')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: true,
        shouldShowVaryApprovalCard: false,
      })
    })

    it('For responsible officer', async () => {
      req = getReqWithRolesAndSource(['ROLE_LICENCE_RO'], 'delius')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: true,
        shouldShowVaryLicenceCard: true,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: true,
        shouldShowViewOrPrintCard: false,
        shouldShowVaryApprovalCard: false,
      })
    })

    it('For non-delius users with RO role', async () => {
      req = getReqWithRolesAndSource(['ROLE_LICENCE_RO'], 'nomis')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: true,
        shouldShowViewOrPrintCard: false,
        shouldShowVaryApprovalCard: false,
      })
    })

    it('For readonly role', async () => {
      req = getReqWithRolesAndSource(['ROLE_LICENCE_READONLY'], 'nomis')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: true,
        shouldShowVaryApprovalCard: false,
      })
    })

    it('For decision maker role', async () => {
      req = getReqWithRolesAndSource(['ROLE_LICENCE_DM'], 'nomis')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: true,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: false,
        shouldShowVaryApprovalCard: false,
      })
    })

    it('For assistant chief officer role', async () => {
      req = getReqWithRolesAndSource(['ROLE_LICENCE_ACO'], 'nomis')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: false,
        shouldShowVaryApprovalCard: true,
      })
    })
  })
})

const getReqWithRolesAndSource = (roles: string[], authSource: string): Request => {
  return {
    user: {
      userRoles: roles,
      authSource,
    },
  } as unknown as Request
}
