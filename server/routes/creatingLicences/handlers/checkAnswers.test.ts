import { Request, Response } from 'express'

import CheckAnswersRoutes from './checkAnswers'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'

jest.mock('../../../services/licenceService')

const licenceService = new LicenceService(null, null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
      },
      user: {
        username: 'joebloggs',
      },
      flash: jest.fn(),
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        licence: {
          appointmentPerson: 'Isaac Newton',
          appointmentAddress: 'Down the road, over there',
          comTelephone: '07891245678',
          appointmentTime: '01/12/2021 00:34',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers')
    })
  })

  describe('POST', () => {
    it('should redirect back with error messages in flash if licence fields are empty', async () => {
      res.locals.licence = {
        appointmentPerson: '',
        appointmentAddress: '',
        comTelephone: '',
        appointmentTime: '',
      }

      await handler.POST(req, res)

      expect(req.flash).toHaveBeenCalledWith(
        'validationErrors',
        JSON.stringify([
          { field: 'appointmentPerson', message: 'The person to meet at the induction meeting must be entered' },
          { field: 'appointmentAddress', message: 'The address of the induction meeting must be entered' },
          { field: 'comTelephone', message: 'The telephone number for the induction meeting must be entered' },
          { field: 'appointmentTime', message: 'The date and time of the induction meeting must be entered' },
        ])
      )
      expect(res.redirect).toHaveBeenCalledWith('back')
    })

    it('should call the licence API to update the status of the licence', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith('1', LicenceStatus.SUBMITTED, 'joebloggs')
    })

    it('should redirect to the confirmation page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/confirmation')
    })
  })
})
