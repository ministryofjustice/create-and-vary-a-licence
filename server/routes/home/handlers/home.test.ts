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
    describe('For case admin role', () => {
      it('With correct auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_CA'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: true,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })

      it('With wrong auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_CA'], 'delius')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })
    })

    describe('For responsible officer', () => {
      it('With correct auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_RO'], 'delius')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: true,
          shouldShowVaryLicenceCard: true,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: true,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })

      it('With wrong auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_RO'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: true,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
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
        shouldShowSupportCard: false,
        shouldShowReportsCard: false,
      })
    })

    describe('For decision maker role', () => {
      it('With correct auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_DM'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: true,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })

      it('With wrong auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_DM'], 'delius')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })
    })

    describe('For assistant chief officer role', () => {
      it('With correct auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_ACO'], 'delius')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: true,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })

      it('With wrong auth source', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_ACO'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
      })
    })

    it('For support admin role', async () => {
      req = getReqWithRolesAndSource(['ROLE_NOMIS_BATCHLOAD'], 'nomis')
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: false,
        shouldShowVaryApprovalCard: false,
        shouldShowSupportCard: true,
        shouldShowReportsCard: true,
      })
    })

    describe('For dpr reporting', () => {
      it('With correct admin role', async () => {
        req = getReqWithRolesAndSource(['ROLE_NOMIS_BATCHLOAD'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: true,
          shouldShowReportsCard: true,
        })
      })

      it('With correct reports role', async () => {
        req = getReqWithRolesAndSource(['ROLE_CVL_REPORTS'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: true,
        })
      })

      it('With incorrect role', async () => {
        req = getReqWithRolesAndSource(['ROLE_LICENCE_ACO'], 'nomis')
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/index', {
          shouldShowCreateLicenceCard: false,
          shouldShowVaryLicenceCard: false,
          shouldShowApproveLicenceCard: false,
          shouldShowMyCaseloadCard: false,
          shouldShowViewOrPrintCard: false,
          shouldShowVaryApprovalCard: false,
          shouldShowSupportCard: false,
          shouldShowReportsCard: false,
        })
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
