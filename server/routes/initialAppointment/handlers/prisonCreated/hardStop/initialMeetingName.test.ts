import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../../../services/licenceService'
import { AppointmentPersonRequest } from '../../../../../@types/licenceApiClientTypes'
import PathType from '../../../../../enumeration/pathType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'
import config from '../../../../../config'

jest.mock('../../initialMeetingUpdatedFlashMessage')

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
          responsibleComFullName: 'Com Name',
        },
      },
    } as unknown as Response
    licenceService.updateAppointmentPerson = jest.fn()
    licenceService.recordAuditEvent = jest.fn()
  })

  describe('Prison user(CA) journey', () => {
    let handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        const appointmentPersonType = {
          DUTY_OFFICER: 'Duty officer',
          RESPONSIBLE_COM: `${res?.locals?.licence?.responsibleComFullName}, this person’s community probation practitioner`,
          SPECIFIC_PERSON: 'Someone else',
        }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
          appointmentPersonType,
          continueOrSaveLabel: 'Continue',
        })

        handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
        res.locals.licence.responsibleComFullName = null
        const appointmentPersonTypeWithOutPP = {
          DUTY_OFFICER: 'Duty officer',
          SPECIFIC_PERSON: 'Someone else',
        }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
          appointmentPersonType: appointmentPersonTypeWithOutPP,
          continueOrSaveLabel: 'Save',
        })
      })

      it('should render view with no appointment needed option if final third enabled', async () => {
        // Given
        config.finalThirdEnabled = true
        const handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
          appointmentPersonType: {
            DUTY_OFFICER: 'Duty officer',
            RESPONSIBLE_COM: 'Com Name, this person’s community probation practitioner',
            SPECIFIC_PERSON: 'Someone else',
            NO_APPOINTMENT_NEEDED: 'No appointment needed',
          },
          continueOrSaveLabel: 'Continue',
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting time page', async () => {
        handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', contactPerson, {
          username: 'joebloggs',
        })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-place')
      })

      it('should redirect to the check your answers page', async () => {
        handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
        req = {
          params: {
            licenceId: '1',
          },
          body: contactPerson,
          query: {},
        } as unknown as Request
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', contactPerson, {
          username: 'joebloggs',
        })
        expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
