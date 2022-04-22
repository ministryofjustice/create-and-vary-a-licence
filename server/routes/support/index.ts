import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import SupportHomeRoutes from './handlers/supportHome'
import SpikeRoutes from './handlers/spikes'
import { Services } from '../../services'
import OffenderSearchRoutes from './handlers/offenderSearch'
import OffenderDetailRoutes from './handlers/offenderDetail'

export default function Index({ licenceService, communityService, prisonerService }: Services): Router {
  const router = Router()
  const routePrefix = (path: string) => `/support${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_NOMIS_BATCHLOAD']), asyncMiddleware(handler))

  const supportHomeHandler = new SupportHomeRoutes()
  const offenderSearchHandler = new OffenderSearchRoutes(prisonerService, communityService)
  const offenderDetailHandler = new OffenderDetailRoutes(prisonerService, communityService)
  const spikeHandlers = new SpikeRoutes(licenceService, communityService, prisonerService)

  // Spikes
  get('/staff/:username/detail', spikeHandlers.getStaffDetail)
  get('/staff/:staffId/caseload', spikeHandlers.getStaffCaseload)
  get('/prisoner/:nomsId/detail', spikeHandlers.getPrisonerDetail)
  get('/prisoner/:nomsId/image', spikeHandlers.getPrisonerImage)
  get('/search/prison', spikeHandlers.searchPrison)
  get('/search/probation', spikeHandlers.searchProbation)

  get('/', supportHomeHandler.GET)
  get('/offender-search', offenderSearchHandler.GET)
  get('/offender/:nomsId/detail', offenderDetailHandler.GET)

  return router
}
