import { RequestHandler, Router } from 'express'
import multer from 'multer'
import asyncMiddleware from '../../middleware/asyncMiddleware'
import fetchLicence from '../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../middleware/roleCheckMiddleware'

import AdditionalLicenceConditionsQuestionRoutes from './handlers/additionalLicenceConditionsQuestion'
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
import AdditionalConditionsYesOrNo from './types/additionalConditionsYesOrNo'
import AdditionalLicenceConditionUploadsHandler from './handlers/additionalLicenceConditionUploadsHandler'
import AdditionalLicenceTypesHandler from './handlers/additionalLicenceTypesHandler'
import AdditionalLicenceConditionDeletionHandler from './handlers/additionalLicenceConditionDeletionHandler'

const upload = multer({ dest: 'uploads/' })

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create${path}`

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

  const additionalLicenceConditionsQuestionHandler = new AdditionalLicenceConditionsQuestionRoutes()
  const additionalLicenceConditionsHandler = new AdditionalLicenceConditionsRoutes(licenceService, conditionService)
  const additionalLicenceConditionsCallbackHandler = new AdditionalLicenceConditionsCallbackRoutes(conditionService)
  const additionalLicenceConditionInputHandler = new AdditionalLicenceConditionInputRoutes(
    licenceService,
    conditionService
  )
  const additionalLicenceConditionUploads = new AdditionalLicenceConditionUploadsHandler(
    licenceService,
    conditionService
  )
  const additionalLicenceTypesHandler = new AdditionalLicenceTypesHandler(licenceService)
  const additionalLicenceConditionDeletionHandler = new AdditionalLicenceConditionDeletionHandler(licenceService)
  const additionalLicenceConditionRemoveUploadHandler = new AdditionalLicenceConditionRemoveUploadRoutes(licenceService)
  const additionalPssConditionsQuestionHandler = new AdditionalPssConditionsQuestionRoutes()
  const additionalPssConditionsHandler = new AdditionalPssConditionsRoutes(licenceService, conditionService)
  const additionalPssConditionsCallbackHandler = new AdditionalPssConditionsCallbackRoutes(conditionService)
  const additionalPssConditionInputHandler = new AdditionalPssConditionInputRoutes(licenceService, conditionService)
  const bespokeConditionsQuestionHandler = new BespokeConditionsQuestionRoutes()
  const bespokeConditionsHandler = new BespokeConditionsRoutes(licenceService)

  get('/id/:licenceId/additional-licence-conditions-question', additionalLicenceConditionsQuestionHandler.GET)
  post(
    '/id/:licenceId/additional-licence-conditions-question',
    additionalLicenceConditionsQuestionHandler.POST,
    AdditionalConditionsYesOrNo
  )
  get('/id/:licenceId/additional-licence-conditions', additionalLicenceConditionsHandler.GET)
  post('/id/:licenceId/additional-licence-conditions', additionalLicenceConditionsHandler.POST, AdditionalConditions)
  get('/id/:licenceId/additional-licence-conditions/callback', additionalLicenceConditionsCallbackHandler.GET)
  get('/id/:licenceId/additional-licence-conditions/condition/:conditionId', additionalLicenceConditionInputHandler.GET)

  // Additional condition forms can include file uploads which uses `multer` middleware on these routes
  postWithFileUpload(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionId',
    additionalLicenceConditionInputHandler.POST
  )
  get('/id/:licenceId/condition/id/:conditionId/remove-upload', additionalLicenceConditionRemoveUploadHandler.GET)
  get(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionCode/file-uploads',
    additionalLicenceConditionUploads.GET
  )
  get(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionId/remove',
    additionalLicenceConditionDeletionHandler.GET
  )
  post(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionId/remove',
    additionalLicenceConditionDeletionHandler.POST
  )
  post(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionCode/file-uploads',
    additionalLicenceConditionUploads.POST
  )

  get('/id/:licenceId/additional-licence-types/condition/:conditionCode/delete', additionalLicenceTypesHandler.DELETE)

  get(
    '/id/:licenceId/additional-licence-conditions/condition/:conditionId/delete',
    additionalLicenceConditionInputHandler.DELETE
  )
  get('/id/:licenceId/additional-pss-conditions-question', additionalPssConditionsQuestionHandler.GET)
  post(
    '/id/:licenceId/additional-pss-conditions-question',
    additionalPssConditionsQuestionHandler.POST,
    PssConditionsYesOrNo
  )
  get('/id/:licenceId/additional-pss-conditions', additionalPssConditionsHandler.GET)
  post('/id/:licenceId/additional-pss-conditions', additionalPssConditionsHandler.POST, AdditionalConditions)
  get('/id/:licenceId/additional-pss-conditions/callback', additionalPssConditionsCallbackHandler.GET)
  get('/id/:licenceId/additional-pss-conditions/condition/:conditionId', additionalPssConditionInputHandler.GET)
  post('/id/:licenceId/additional-pss-conditions/condition/:conditionId', additionalPssConditionInputHandler.POST)
  post(
    '/id/:licenceId/additional-pss-conditions/condition/:conditionId/delete',
    additionalPssConditionInputHandler.DELETE
  )
  get('/id/:licenceId/bespoke-conditions-question', bespokeConditionsQuestionHandler.GET)
  post('/id/:licenceId/bespoke-conditions-question', bespokeConditionsQuestionHandler.POST, BespokeConditionsYesOrNo)
  get('/id/:licenceId/bespoke-conditions', bespokeConditionsHandler.GET)
  post('/id/:licenceId/bespoke-conditions', bespokeConditionsHandler.POST, BespokeConditions)
  get('/id/:licenceId/bespoke-conditions/delete', bespokeConditionsHandler.DELETE)

  return router
}
