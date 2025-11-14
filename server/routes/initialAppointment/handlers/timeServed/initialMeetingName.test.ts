import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../../services/licenceService'
import { AppointmentPersonRequest } from '../../../../@types/licenceApiClientTypes'
import PathType from '../../../../enumeration/pathType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'
import UserType from '../../../../enumeration/userType'

jest.mock('../initialMeetingUpdatedFlashMessage')

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

  describe('Prison user(CA) time served journey', () => {
    let handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)

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
          continueOrSaveLabel: 'Continue',
          isProbationPractionerAllocated: true,
        })

        handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
        res.locals.licence.responsibleComFullName = null
        const appointmentPersonTypeWithOutPP = {
          DUTY_OFFICER: 'Duty Officer',
          SPECIFIC_PERSON: 'Someone else',
        }
        await handler.GET(req, res)
        expect(res.render).toHaveBeenCalledWith('pages/create/hardStop/initialMeetingPerson', {
          appointmentPersonType: appointmentPersonTypeWithOutPP,
          continueOrSaveLabel: 'Continue',
          isProbationPractionerAllocated: false,
        })
      })
    })

    describe('POST', () => {
      it('should redirect to the meeting place page', async () => {
        handler = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
        await handler.POST(req, res)
        expect(licenceService.updateAppointmentPerson).toHaveBeenCalledWith('1', contactPerson, {
          username: 'joebloggs',
        })
        expect(res.redirect).toHaveBeenCalledWith('/licence/time-served/create/id/1/initial-meeting-place')
      })

      it('should call to generate a flash message', async () => {
        await handler.POST(req, res)
        expect(flashInitialApptUpdatedMessage).toHaveBeenCalledWith(req, res.locals.licence, UserType.PRISON)
      })
    })
  })
})
