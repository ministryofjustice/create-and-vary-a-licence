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
      req = getReqWithRoles(['ROLE_LICENCE_CA'])
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: true,
      })
    })

    it('For responsible officer', async () => {
      req = getReqWithRoles(['ROLE_LICENCE_RO'])
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: true,
        shouldShowVaryLicenceCard: true,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: true,
        shouldShowViewOrPrintCard: false,
      })
    })

    it('For readonly role', async () => {
      req = getReqWithRoles(['ROLE_LICENCE_READONLY'])
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: false,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: true,
      })
    })

    it('For decision maker role', async () => {
      req = getReqWithRoles(['ROLE_LICENCE_DM'])
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/index', {
        shouldShowCreateLicenceCard: false,
        shouldShowVaryLicenceCard: false,
        shouldShowApproveLicenceCard: true,
        shouldShowMyCaseloadCard: false,
        shouldShowViewOrPrintCard: false,
      })
    })
  })
})

const getReqWithRoles = (roles: string[]): Request => {
  return {
    user: {
      userRoles: roles,
    },
  } as unknown as Request
}
