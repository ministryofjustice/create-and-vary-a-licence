import { Request, Response } from 'express'
import LicenceKind from '../enumeration/LicenceKind'
import LicenceService from '../services/licenceService'
import timeServedCheckMiddleware from './timeServedCheckMiddleware'
import UserType from '../enumeration/userType'
import { Licence } from '../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('timeServedCheckMiddleware', () => {
  let req: Request
  let res: Response
  const next = jest.fn()

  const licence = {
    conditionalReleaseDate: '14/05/2022',
    actualReleaseDate: '14/05/2022',
    sentenceStartDate: '14/05/2022',
    kind: LicenceKind.TIME_SERVED,
  } as Licence

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
        licence,
      },
    } as unknown as Response
    licenceService.updateAppointmentPerson = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('Probation users', () => {
    const userType = UserType.PROBATION
    it('should redirect to access-denied when time served', () => {
      res.locals.licence = { ...licence, kind: LicenceKind.TIME_SERVED } as Licence
      timeServedCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      expect(next).not.toHaveBeenCalled()
    })

    it('should call next if the licence is not time served', () => {
      res.locals.licence = { ...licence, kind: LicenceKind.CRD } as Licence
      timeServedCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Prison users', () => {
    const userType = UserType.PRISON
    it('should redirect prison users to access-denied when the licence is not time served', async () => {
      res.locals.licence = { ...licence, kind: LicenceKind.CRD } as Licence
      timeServedCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/access-denied')
    })

    it('should call next if the licence is time served', () => {
      res.locals.licence = { ...licence, kind: LicenceKind.TIME_SERVED } as Licence
      timeServedCheckMiddleware(userType)(req, res, next)
      expect(res.redirect).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })
})
