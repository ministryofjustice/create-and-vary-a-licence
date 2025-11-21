import { RequestHandler, Router } from 'express'
import DeletePreferredAddressRoutes from './handlers/deletePreferredAddress'
import { Services } from '../../../../../../services'
import roleCheckMiddleware from '../../../../../../middleware/roleCheckMiddleware'

export default function Index({ addressService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/staff/hard-stop${path}`

  const del = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']), handler)

  {
    const controller = new DeletePreferredAddressRoutes(addressService)
    del('/delete/id/:licenceId/address/preferred/:reference', controller.DELETE)
  }

  return router
}
