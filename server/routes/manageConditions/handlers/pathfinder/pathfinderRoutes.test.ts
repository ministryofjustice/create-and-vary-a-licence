import { Request, Response } from 'express'
import ConditionService from '../../../../services/conditionService'
import LicenceService from '../../../../services/licenceService'
import PathfinderRoutes from './pathfinderRoutes'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Pathfinder Details', () => {
  const handler = new PathfinderRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: 1,
      },
      query: {},
      body: {
        isToBeTaggedForProgramme: 'Yes',
        programmeName: 'Pathfinder Programme',
      },
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
        licence: {
          id: 1,
          version: 'version',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should render view', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/pathfinder/input')
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.updateElectronicMonitoringProgramme = jest.fn()
    })

    it('should call licence service to update electronic monitoring programme', async () => {
      await handler.POST(req, res)
      expect(licenceService.updateElectronicMonitoringProgramme).toHaveBeenCalledWith(1, {
        isToBeTaggedForProgramme: true,
        programmeName: 'Pathfinder Programme',
      })
    })

    it('should redirect to the bespoke conditions question page', async () => {
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/bespoke-conditions-question')
    })

    it('should redirect to the check your answers page', async () => {
      req.query.fromReview = 'true'
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
