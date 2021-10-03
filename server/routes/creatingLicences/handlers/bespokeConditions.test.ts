import { Request, Response } from 'express'

import BespokeConditions from '../types/bespokeConditions'
import BespokeConditionsRoutes from './bespokeConditions'
import LicenceService from '../../../services/licenceService'

const licenceService = new LicenceService(null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Bespoke Conditions', () => {
  const handler = new BespokeConditionsRoutes(licenceService)
  let req: Request
  let res: Response
  let formBespokeConditions: BespokeConditions

  beforeEach(() => {
    formBespokeConditions = {
      conditions: ['Condition 1', 'Condition 2'],
    } as unknown as BespokeConditions

    req = {
      params: {
        licenceId: 1,
      },
      body: formBespokeConditions,
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
          bespokeConditions: [
            { id: 1, seq: 0, text: 'Condition 1' },
            { id: 2, seq: 1, text: 'Condition 2' },
          ],
        },
      },
    } as unknown as Response

    licenceService.updateBespokeConditions = jest.fn()
  })

  describe('GET', () => {
    it('should render licence with bespoke conditions view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/bespokeConditions', {
        conditions: formBespokeConditions.conditions,
      })
    })
  })

  describe('POST', () => {
    it('should redirect to the check answers page', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateBespokeConditions).toHaveBeenCalledWith(
        1,
        formBespokeConditions,
        res.locals.user.username
      )
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
