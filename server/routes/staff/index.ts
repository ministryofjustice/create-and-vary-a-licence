import { RequestHandler, Router } from 'express'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import { Services } from '../../services'
import DeletePreferredAddressRoutes from './handlers/deletePreferredAddress'
import checkComCaseAccessMiddleware from '../../middleware/checkComCaseAccessMiddleware'

export default function Index({ addressService, licenceService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/staff${path}`

  const del = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']),
      checkComCaseAccessMiddleware(licenceService),
      handler,
    )

  {
    const controller = new DeletePreferredAddressRoutes(addressService)
    del('/delete/id/:licenceId/address/preferred/:reference', controller.DELETE)
  }

  return router
}
