import { RequestHandler, Router } from 'express'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import { Services } from '../../services'
import StandardCurfewHoursQuestionRoutes from './handlers/standardCurfewHoursQuestion'
import licenceKindCheckMiddleware from '../../middleware/licenceKindCheckMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import { LicenceKind } from '../../enumeration'
import YesOrNoQuestion from '../creatingLicences/types/yesOrNo'

export default function Index(services: Services): Router {
  const router = Router()
  const { conditionService, licenceService } = services

  const routePrefix = (path: string) => `/licence/create/id/:licenceId/hdc${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      licenceKindCheckMiddleware([
        LicenceKind.CRD,
        LicenceKind.HARD_STOP,
        LicenceKind.HDC_VARIATION,
        LicenceKind.PRRD,
        LicenceKind.TIME_SERVED,
        LicenceKind.VARIATION,
      ]),
      handler,
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA', 'ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      licenceKindCheckMiddleware([
        LicenceKind.CRD,
        LicenceKind.HARD_STOP,
        LicenceKind.HDC_VARIATION,
        LicenceKind.PRRD,
        LicenceKind.TIME_SERVED,
        LicenceKind.VARIATION,
      ]),
      validationMiddleware(conditionService, type),
      handler,
    )

  {
    const controller = new StandardCurfewHoursQuestionRoutes()
    get('/standard-curfew-hours-question', controller.GET)
    post('/standard-curfew-hours-question', controller.POST, YesOrNoQuestion)
  }

  return router
}
