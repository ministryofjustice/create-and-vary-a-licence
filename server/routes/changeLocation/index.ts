import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import ChangeLocationRoutes from './handlers/changeLocation'
import { Services } from '../../services'
import Caseload from './types/caseload'

export default function Index({ userService }: Services): Router {
  const routePrefix = (path: string) => `/licence${path}`

  const router = Router()
  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_CA']), asyncMiddleware(handler))

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      validationMiddleware(type),
      asyncMiddleware(handler)
    )
  const locationHandler = new ChangeLocationRoutes(userService)

  get('/change-location', locationHandler.GET)
  post('/change-location', locationHandler.POST, Caseload)

  return router
}
