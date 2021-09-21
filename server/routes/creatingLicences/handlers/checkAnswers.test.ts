import { Request, Response } from 'express'

import CheckAnswersRoutes from './checkAnswers'
import LicenceService from '../../../services/licenceService'

jest.mock('../../../services/licenceService')

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Check Answers', () => {
  const handler = new CheckAnswersRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    licenceService.getLicenceStub.mockReturnValue({
      offender: {
        name: 'Adam Balasaravika',
        prison: 'Brixton Prison',
      },
    })
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/checkAnswers', {
        licence: {
          offender: {
            name: 'Adam Balasaravika',
            prison: 'Brixton Prison',
          },
        },
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the confirmation page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/confirmation')
    })
  })
})
