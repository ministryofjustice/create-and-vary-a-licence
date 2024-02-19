import { Request, Response } from 'express'
import LicenceKind from '../enumeration/LicenceKind'
import LicenceService from '../services/licenceService'
import hardStopCheckMiddleware from './hardStopCheckMiddleware'
import UserType from '../enumeration/userType'
import config from '../config'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('hardStopCheckMiddleware', () => {
  let req: Request
  let res: Response
  const next = jest.fn()
  const existingConfig = config

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: {},
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          conditionalReleaseDate: '14/05/2022',
          kind: LicenceKind.CRD,
          isEligibleForEarlyRelease: true,
          isInHardStopPeriod: false,
        },
      },
    } as unknown as Response
    licenceService.updateAppointmentPerson = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
    config.hardStopEnabled = true
  })

  afterEach(() => {
    jest.resetAllMocks()
    config.hardStopEnabled = existingConfig.hardStopEnabled
  })

  describe('Probation users', () => {
    const userType = UserType.PROBATION
    it('should redirect to access-denied when in the hard stop period', () => {
      res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true }
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(next).not.toHaveBeenCalled()
    })

    it('should redirect to access-denied for variations', () => {
      res.locals.licence.kind = LicenceKind.VARIATION
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next if the licence is not a variation and is outside of the hard stop window', () => {
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should not redirect if the hard stop feature flag is disabled', () => {
      config.hardStopEnabled = false
      res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true }
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Prison users', () => {
    const userType = UserType.PRISON
    it('should redirect prison users to access-denied when the licence is not in the hard stop period', async () => {
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should redirect to access-denied for variations', () => {
      res.locals.licence.kind = LicenceKind.VARIATION
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next if the licence is not a variation and is in the hard stop window', () => {
      res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true }
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should redirect to access-denied if the hard stop feature flag is disabled', () => {
      config.hardStopEnabled = false
      res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true }
      hardStopCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(next).not.toHaveBeenCalled()
    })
  })
})
