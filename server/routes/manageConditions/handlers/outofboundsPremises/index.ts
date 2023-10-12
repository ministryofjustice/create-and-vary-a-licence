import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../../../middleware/asyncMiddleware'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import type { Services } from '../../../../services'
import OutofboundsPremisesInputRoutes from './outOfBoundsPremisesInputRoutes'
import OutOfBoundsPremisesListRoutes from './outOfBoundsPremisesListRoutes'
import OutOfBoundsPremisesRemovalRoutes from './outOfBoundsPremisesRemovalRoutes'

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create/id/:licenceId${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      asyncMiddleware(handler)
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  {
    // View out of bounds premises list / add new premises condition
    const controller = new OutOfBoundsPremisesListRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionCode/outofbounds-premises', controller.GET)
    post('/additional-licence-conditions/condition/:conditionCode/outofbounds-premises', controller.POST)
  }

  {
    // upload/delete out of bounds premises from input page
    const controller = new OutofboundsPremisesInputRoutes(licenceService)
    post('/additional-licence-conditions/condition/:conditionId/outofbounds-premises-input', controller.POST)
    get('/additional-licence-conditions/condition/:conditionId/outofbounds-premises-delete', controller.DELETE)
  }

  // remove premises from list with confirmation (delete single conditions)
  {
    const controller = new OutOfBoundsPremisesRemovalRoutes(licenceService)
    get('/additional-licence-conditions/condition/:conditionId/outofbounds-premises-removal', controller.GET)
    post('/additional-licence-conditions/condition/:conditionId/outofbounds-premises-removal', controller.POST)
  }

  return router
}
