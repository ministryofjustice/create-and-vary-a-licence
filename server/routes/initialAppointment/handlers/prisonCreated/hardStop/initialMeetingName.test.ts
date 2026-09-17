import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../../../services/licenceService'
import { AppointmentPersonRequest } from '../../../../../@types/licenceApiClientTypes'
import PathType from '../../../../../enumeration/pathType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../../enumeration/userType'
import config from '../../../../../config'

jest.mock('../../initialMeetingUpdatedFlashMessage')
jest.mock('../../../../../services/licenceService')

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Name', () => {
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
          id: 1,
          responsibleComFullName: 'Com Name',
        },
      },
    } as unknown as Response
  })

  describe('Prison user(CA) journey', () => {
    let handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

    describe('GET', () => {
      it('should render view', async () => {
        // Given
        const appointmentPersonType = {
          DUTY_OFFICER: 'Duty officer',
          RESPONSIBLE_COM: `${res?.locals?.licence?.responsibleComFullName}, this person’s community probation practitioner`,
          SPECIFIC_PERSON: 'Someone else',
        }

        // When
        await handler.GET(req, res)

        // Then
        expect(res.render).toHaveBeenCalledWith('pages/initialAppointment/prisonCreated/initialMeetingPerson', {
          appointmentPersonType,
          continueOrSaveLabel: 'Continue',
        })

        // Given
        handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
        res.locals.licence.responsibleComFullName = null
        const appointmentPersonTypeWithOutPP = {
          DUTY_OFFICER: 'Duty officer',
          SPECIFIC_PERSON: 'Someone else',
        }

        // When
        await handler.GET(req, res)

        // Then
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
      describe('CREATE', () => {
        const handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

        it('should redirect to the meeting place page', async () => {
          // Given
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: false })

          // When
          await handler.POST(req, res)

          // Then
          expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith(1, contactPerson, {
            username: 'joebloggs',
          })
          expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/initial-meeting-place')
        })

        it('should redirect to licence contact address page if no appointment needed while creating licence', async () => {
          // Given
          req.body.appointmentPersonType = 'NO_APPOINTMENT_NEEDED'
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: false })

          // When
          await handler.POST(req, res)

          // Then
          expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith(1, req.body, {
            username: 'joebloggs',
          })
          expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/create/id/1/licence-contact-address')
        })
      })
      describe('EDIT', () => {
        const handler = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)

        it('should redirect to meeting time page if appointment type changed from not required', async () => {
          // Given
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: true })

          // When
          await handler.POST(req, res)

          // Then
          expect(res.redirect).toHaveBeenCalledWith(
            `/licence/hard-stop/edit/id/${res.locals.licence.id}/initial-meeting-time`,
          )
        })

        it('should redirect to check answers if appointment changed to not required while editing licence', async () => {
          // Given
          req.body.appointmentPersonType = 'NO_APPOINTMENT_NEEDED'
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: false })

          // When
          await handler.POST(req, res)

          // Then
          expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
        })
        it('should generate a flash message if appointment type is changed while editing the licence', async () => {
          // Given
          res.locals.licence.appointmentPersonType = 'RESPONSIBLE_COM'
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: false })

          // When
          await handler.POST(req, res)

          // Then
          expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON, false)
        })

        it('should redirect to the check your answers page if all required appointment details are populated', async () => {
          // Given
          req = {
            params: {
              licenceId: '1',
            },
            body: contactPerson,
            query: {},
          } as unknown as Request
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: false })

          // When
          await handler.POST(req, res)

          // Then
          expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith(1, contactPerson, {
            username: 'joebloggs',
          })
          expect(res.redirect).toHaveBeenCalledWith('/licence/hard-stop/id/1/check-your-answers')
        })
        it('should generate a flash message if appointment type updated while editing and time has been set', async () => {
          // Given
          licenceService.updateAppointmentPerson.mockResolvedValue({ missingAppointmentTime: false })

          // When
          await handler.POST(req, res)

          // Then
          expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON, false)
        })
      })
    })
  })
})
