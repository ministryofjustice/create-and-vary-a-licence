import { Request, Response } from 'express'

import InitialMeetingNameRoutes from './initialMeetingName'
import LicenceService from '../../../../services/licenceService'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Initial Meeting Name - Probation users', () => {
  let req: Request
  let res: Response

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
      })
    })

    /** To be added */
    describe('POST', () => {})
  })
})
