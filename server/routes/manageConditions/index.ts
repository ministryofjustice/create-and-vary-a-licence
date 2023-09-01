import { RequestHandler, Router } from 'express'
import multer from 'multer'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import AdditionalLicenceConditionsRoutes from './handlers/additionalLicenceConditions'
import BespokeConditionsQuestionRoutes from './handlers/bespokeConditionsQuestion'
import BespokeConditionsRoutes from './handlers/bespokeConditions'
import BespokeConditions from './types/bespokeConditions'

import { Services } from '../../services'
import AdditionalConditions from './types/additionalConditions'
import AdditionalLicenceConditionsCallbackRoutes from './handlers/additionalLicenceConditionsCallback'
import AdditionalLicenceConditionInputRoutes from './handlers/additionalLicenceConditionInput'
import AdditionalPssConditionsQuestionRoutes from './handlers/additionalPssConditionsQuestion'
import AdditionalPssConditionsRoutes from './handlers/additionalPssConditions'
import AdditionalPssConditionsCallbackRoutes from './handlers/additionalPssConditionsCallback'
import AdditionalPssConditionInputRoutes from './handlers/additionalPssConditionInput'
import AdditionalLicenceConditionRemoveUploadRoutes from './handlers/additionalLicenceConditionRemoveUpload'
import BespokeConditionsYesOrNo from './types/bespokeConditionsYesOrNo'
import PssConditionsYesOrNo from './types/pssConditionsYesOrNo'
import AdditionalLicenceConditionUploadsRoutes from './handlers/additionalLicenceConditionUploadsHandler'
import AdditionalLicenceTypesRoutes from './handlers/additionalLicenceTypesHandler'
import AdditionalLicenceConditionDeletionRoutes from './handlers/additionalLicenceConditionDeletionHandler'

const upload = multer({ dest: 'uploads/' })

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create${path}/id/:licenceId`

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

  {
    const controller = new AdditionalLicenceConditionRemoveUploadRoutes(licenceService)
    get('/condition/id/:conditionId/remove-upload', controller.GET)
  }

  {
    const controller = new AdditionalLicenceConditionUploadsRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionCode/file-uploads', controller.GET)
    post('/additional-licence-conditions/condition/:conditionCode/file-uploads', controller.POST)
  }

  {
    const controller = new AdditionalLicenceConditionDeletionRoutes(licenceService)
    get('/additional-licence-conditions/condition/:conditionId/remove', controller.GET)
    post('/additional-licence-conditions/condition/:conditionId/remove', controller.POST)
  }

  {
    const controller = new AdditionalLicenceTypesRoutes(licenceService)
    get('/additional-licence-types/condition/:conditionCode/delete', controller.DELETE)
  }

  {
    const controller = new AdditionalLicenceConditionInputRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionId', controller.GET)
    postWithFileUpload('/additional-licence-conditions/condition/:conditionId', controller.POST)
    get('/additional-licence-conditions/condition/:conditionId/delete', controller.DELETE)
  }

  {
    const controller = new AdditionalPssConditionsQuestionRoutes()
    get('/additional-pss-conditions-question', controller.GET)
    post('/additional-pss-conditions-question', controller.POST, PssConditionsYesOrNo)
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
    const controller = new BespokeConditionsQuestionRoutes()
    get('/bespoke-conditions-question', controller.GET)
    post('/bespoke-conditions-question', controller.POST, BespokeConditionsYesOrNo)
  }

  {
    const controller = new BespokeConditionsRoutes(licenceService)
    get('/bespoke-conditions', controller.GET)
    post('/bespoke-conditions', controller.POST, BespokeConditions)
    get('/bespoke-conditions/delete', controller.DELETE)
  }

  return router
}
