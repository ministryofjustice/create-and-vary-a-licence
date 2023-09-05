import { RequestHandler, Router } from 'express'
import multer from 'multer'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import AdditionalLicenceConditionsRoutes from './handlers/additionalLicenceConditions'
import BespokeConditionsRoutes from './handlers/bespokeConditions'
import BespokeConditions from './types/bespokeConditions'

import type { Services } from '../../services'
import AdditionalConditions from './types/additionalConditions'
import AdditionalLicenceConditionsCallbackRoutes from './handlers/additionalLicenceConditionsCallback'
import AdditionalLicenceConditionInputRoutes from './handlers/additionalLicenceConditionInput'
import AdditionalPssConditionsRoutes from './handlers/additionalPssConditions'
import AdditionalPssConditionsCallbackRoutes from './handlers/additionalPssConditionsCallback'
import AdditionalPssConditionInputRoutes from './handlers/additionalPssConditionInput'
import AdditionalLicenceConditionUploadsRoutes from './handlers/additionalLicenceConditionUploadsHandler'
import DeleteConditionsByCodeRoutes from './handlers/deleteConditionsByCodeHandler'
import AdditionalLicenceConditionUploadsRemovalRoutes from './handlers/additionalLicenceConditionUploadsRemovalHandler'

const upload = multer({ dest: 'uploads/' })

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create/id/:licenceId${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
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

  const postWithFileUpload = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      upload.single('outOfBoundFilename'),
      validationMiddleware(conditionService, type),
      asyncMiddleware(handler)
    )

  {
    const controller = new AdditionalLicenceConditionsRoutes(licenceService, conditionService)
    get('/additional-licence-conditions', controller.GET)
    post('/additional-licence-conditions', controller.POST, AdditionalConditions)
  }

  {
    const controller = new AdditionalLicenceConditionsCallbackRoutes(conditionService)
    get('/additional-licence-conditions/callback', controller.GET)
  }

  // START MEZ
  {
    // View map list / add new map condition
    const controller = new AdditionalLicenceConditionUploadsRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionCode/file-uploads', controller.GET)
    post('/additional-licence-conditions/condition/:conditionCode/file-uploads', controller.POST)
  }

  // remove area from map list with confirmation (delete single conditions)
  {
    const controller = new AdditionalLicenceConditionUploadsRemovalRoutes(licenceService)
    get('/additional-licence-conditions/condition/:conditionId/file-upload-removal', controller.GET)
    post('/additional-licence-conditions/condition/:conditionId/file-upload-removal', controller.POST)
  }
  // END MEZ

  {
    const controller = new AdditionalLicenceConditionInputRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionId', controller.GET)
    postWithFileUpload('/additional-licence-conditions/condition/:conditionId', controller.POST)
    get('/additional-licence-conditions/condition/:conditionId/delete', controller.DELETE)
  }

  {
    const controller = new DeleteConditionsByCodeRoutes(licenceService)
    get('/additional-licence-conditions/condition/code/:conditionCode/delete', controller.DELETE)
  }

  {
    const controller = new AdditionalPssConditionsRoutes(licenceService, conditionService)
    get('/additional-pss-conditions', controller.GET)
    post('/additional-pss-conditions', controller.POST, AdditionalConditions)
  }

  {
    const controller = new AdditionalPssConditionsCallbackRoutes(conditionService)
    get('/additional-pss-conditions/callback', controller.GET)
  }

  {
    const controller = new AdditionalPssConditionInputRoutes(licenceService, conditionService)
    get('/additional-pss-conditions/condition/:conditionId', controller.GET)
    post('/additional-pss-conditions/condition/:conditionId', controller.POST)
    post('/additional-pss-conditions/condition/:conditionId/delete', controller.DELETE)
  }

  {
    const controller = new BespokeConditionsRoutes(licenceService)
    get('/bespoke-conditions', controller.GET)
    post('/bespoke-conditions', controller.POST, BespokeConditions)
    get('/bespoke-conditions/delete', controller.DELETE)
  }

  return router
}
