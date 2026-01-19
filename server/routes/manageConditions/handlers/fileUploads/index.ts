import { RequestHandler, Router } from 'express'
import multer from 'multer'
import fetchLicence from '../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../middleware/roleCheckMiddleware'

import type { Services } from '../../../../services'
import FileUploadInputRoutes from './fileUploadInputRoutes'
import FileUploadListRoutes from './fileUploadListRoutes'
import FileUploadRemovalRoutes from './fileUploadRemovalRoutes'
import FileUploadType from '../../../../enumeration/fileUploadType'

const upload = multer({ dest: 'uploads/' })

export default function Index({ licenceService, conditionService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/create/id/:licenceId${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_RO']), fetchLicence(licenceService), handler)

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )

  const postWithFileUpload = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      fetchLicence(licenceService),
      upload.fields([
        { name: 'inBoundFilename', maxCount: 1 },
        { name: 'outOfBoundFilename', maxCount: 1 },
      ]),
      validationMiddleware(conditionService, type),
      handler,
    )

  {
    // View map list / add new map condition
    const controller = new FileUploadListRoutes(licenceService, conditionService)
    get('/additional-licence-conditions/condition/:conditionCode/file-uploads', controller.GET)
    post('/additional-licence-conditions/condition/:conditionCode/file-uploads', controller.POST)
  }

  {
    // upload/delete files from input page for multi-instance conditions (eg MEZ)
    const controller = new FileUploadInputRoutes(licenceService, FileUploadType.MULTI_INSTANCE)
    postWithFileUpload('/additional-licence-conditions/condition/:conditionId/file-upload-input', controller.POST)
    get('/additional-licence-conditions/condition/:conditionId/file-upload-delete', controller.DELETE)
  }

  {
    // upload/delete files from input page for single-instance conditions
    const controller = new FileUploadInputRoutes(licenceService, FileUploadType.SINGLE_INSTANCE)
    postWithFileUpload('/additional-licence-conditions/condition/:conditionId/file-upload', controller.POST)
    get('/additional-licence-conditions/condition/:conditionId/delete', controller.DELETE)
  }

  // remove area from map list with confirmation (delete single conditions)
  {
    const controller = new FileUploadRemovalRoutes(licenceService)
    get('/additional-licence-conditions/condition/:conditionId/file-upload-removal', controller.GET)
    post('/additional-licence-conditions/condition/:conditionId/file-upload-removal', controller.POST)
  }

  return router
}
