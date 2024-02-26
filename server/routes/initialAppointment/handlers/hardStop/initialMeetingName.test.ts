import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../../services/licenceService'
import { AppointmentPersonRequest } from '../../../../@types/licenceApiClientTypes'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Name - Probation users', () => {
  let req: Request
  let res: Response
  const contactPerson = {
    appointmentPersonType: 'SPECIFIC_PERSON',
    appointmentPerson: 'specific person',
  } as AppointmentPersonRequest

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      body: contactPerson,
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
          responsibleComFullName: 'Simon Webster',
        },
      },
    } as unknown as Response
    licenceService.updateAppointmentPerson = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Prison user(CA) journey', () => {
    const handler = new InitialMeetingNameRoutes(licenceService)

    describe('GET', () => {
      it('should render view', async () => {
        const appointmentPersonType = {
          DUTY_OFFICER: 'Duty Officer',
          RESPONSIBLE_COM: `${res?.locals?.licence?.responsibleComFullName}, this person’s probation practitioner`,
          SPECIFIC_PERSON: 'Someone else',
        }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingPerson', {
          appointmentPersonType,
        })

        res.locals.licence.responsibleComFullName = null
        const appointmentPersonTypeWithOutPP = {
          DUTY_OFFICER: 'Duty Officer',
          SPECIFIC_PERSON: 'Someone else',
        }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingPerson', {
          appointmentPersonType: appointmentPersonTypeWithOutPP,
        })
      })
    })

    /** To be added */
    describe('POST', () => {
      it('should redirect to the meeting time page', async () => {
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', contactPerson, {
          username: 'joebloggs',
        })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-place')
      })

      it('should redirect to the check your answers page', async () => {
        req = {
          params: {
            licenceId: '1',
          },
          body: contactPerson,
          query: {},
          path: 'edit',
        } as unknown as Request
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', contactPerson, {
          username: 'joebloggs',
        })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })
    })
  })
})
