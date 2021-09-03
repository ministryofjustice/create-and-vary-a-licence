import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import SpikeRoutes from './handlers/spikes'
import { Services } from '../../services'

export default function Index({ licenceService, communityService, prisonerService }: Services): Router {
  const router = Router()

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))

  const spikeHandlers = new SpikeRoutes(licenceService, communityService, prisonerService)

  get('/test/data', spikeHandlers.listTestData)
  get('/staff/:username/detail', spikeHandlers.getStaffDetail)
  get('/staff/:staffId/caseload', spikeHandlers.getStaffCaseload)
  get('/prisoner/:nomsId/detail', spikeHandlers.getPrisonerDetail)
  get('/prisoner/:nomsId/image', spikeHandlers.getPrisonerImage)
  get('/licence/staffId/:staffId/caseload', spikeHandlers.getUserCaseload)
  get('/caseload', spikeHandlers.getCaseloadView)

  return router
}
