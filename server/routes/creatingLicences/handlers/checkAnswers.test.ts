import { Request, Response } from 'express'

import CheckAnswersRoutes from './checkAnswers'
import LicenceService from '../../../services/licenceService'

jest.mock('../../../services/licenceService')

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceService)
  let req: Request
  let res: Response

  afterEach(() => {
    jest.resetAllMocks()
  })

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      flash: jest.fn(),
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
          deliusStaffIdentifier: 123,
        },
        licence: {
          id: 1,
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          appointmentContact: '07891245678',
          appointmentTime: '01/12/2021 00:34',
          additionalLicenceConditions: [],
          additionalPssConditions: [],
          bespokeConditions: [],
          comStaffId: 123,
          forename: 'Jim',
          surname: 'Jones',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view and not record audit event (owner)', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers')
      expect(licenceService.recordAuditEvent).not.toHaveBeenCalled()
    })

    it('should render view and record audit event (not owner)', async () => {
      res = {
        ...res,
        locals: {
          ...res.locals,
          user: {
            username: 'joebloggs',
            deliusStaffIdentifier: 999,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers')
      expect(licenceService.recordAuditEvent).toHaveBeenCalled()
    })
  })

  describe('POST', () => {
    it('should redirect back with error messages in flash if licence fields are empty', async () => {
      res.locals.licence = {
        appointmentPerson: '',
        appointmentAddress: '',
        appointmentContact: '',
        appointmentTime: '',
      }

      await handler.POST(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([
          { field: 'appointmentPerson', message: 'The person to meet at the induction meeting must be entered' },
          { field: 'appointmentAddress', message: 'The address of the induction meeting must be entered' },
          { field: 'appointmentContact', message: 'The telephone number for the induction meeting must be entered' },
          { field: 'appointmentTime', message: 'The date and time of the induction meeting must be entered' },
        ])
      )
      expect(res.redirect).toHaveBeenCalledWith('back')
    })

    it('should call the licence API to submit the licence for approval', async () => {
      await handler.POST(req, res)
      expect(licenceService.submitLicence).toHaveBeenCalledWith('1', {
        username: 'joebloggs',
        deliusStaffIdentifier: 123,
      })
    })

    it('should redirect to the confirmation page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/confirmation')
    })
  })
})
