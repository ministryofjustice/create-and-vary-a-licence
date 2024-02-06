import { Request, Response } from 'express'

import InitialMeetingContactRoutes from './initialMeetingContact'
import LicenceService from '../../../services/licenceService'
import Telephone from '../types/telephone'
import UserType from '../../../enumeration/userType'
import LicenceKind from '../../../enumeration/LicenceKind'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Contact', () => {
  let req: Request
  let res: Response
  let contactNumber: Telephone

  beforeEach(() => {
    contactNumber = {
      telephone: '0114 2556556',
    } as Telephone

    req = {
      params: {
        licenceId: 1,
      },
      body: contactNumber,
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

    licenceService.updateContactNumber = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Probation user journey', () => {
    const handler = new InitialMeetingContactRoutes(licenceService, UserType.PROBATION)

    describe('GET', () => {
      it('should render view when not in the hard stop period', async () => {
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingContact', {
          releaseIsOnBankHolidayOrWeekend: true,
        })
      })

      it('should redirect to access-denied when in the hard stop period', async () => {
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true }
        await handler.GET(req, res)
        expect(res.render).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting time page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556' },
          { username: 'joebloggs' }
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/initial-meeting-time')
      })

      it('should redirect to the check your answers page if fromReview flag is set', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
      })
    })
  })

  describe('Prison user journey', () => {
    const handler = new InitialMeetingContactRoutes(licenceService, UserType.PRISON)

    describe('GET', () => {
      it('should redirect to access-denied when the licence is not in the hard stop period', async () => {
        await handler.GET(req, res)
        expect(res.render).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith('/access-denied')
      })

      it('should render view when the licence is in the hard stop period', async () => {
        res.locals.licence = { ...res.locals.licence, kind: LicenceKind.CRD, isInHardStopPeriod: true }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/initialMeetingContact', {
          releaseIsOnBankHolidayOrWeekend: true,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the show page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateContactNumber).toHaveBeenCalledWith(
          1,
          { telephone: '0114 2556556' },
          { username: 'joebloggs' }
        )
        expect(res.redirect).toHaveBeenCalledWith('/licence/view/id/1/show')
      })
    })
  })
})
