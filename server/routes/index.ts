import { RequestHandler, Router } from 'express'
import asyncMiddleware from '../middleware/asyncMiddleware'
import { Services } from '../services'
import OtherRoutes from './OtherRoutes'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'

export default function Index({ userService, prisonerService, licenceService, communityService }: Services): Router {
  const router = Router({ mergeParams: true })

  const get = (path: string, handler: RequestHandler) => router.get(path, asyncMiddleware(handler))
  // const post = (path: string, handler: RequestHandler) => router.post(path, asyncMiddleware(handler))

  const otherAccessRoutes = new OtherRoutes(userService, prisonerService, licenceService, communityService)

  const indexRoutes = () =>
    get('/', (req, res) => {
      res.render('pages/index')
    })

  const otherRoutes = () => {
    get('/test/data', otherAccessRoutes.listTestData)
    get('/staff/:username/detail', otherAccessRoutes.getStaffDetail)
    get('/staff/:staffId/caseload', otherAccessRoutes.getStaffCaseload)
    get('/prisoner/:nomsId/detail', otherAccessRoutes.getPrisonerDetail)
  }

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(userService))
  router.use((req, res, next) => {
    if (typeof req.csrfToken === 'function') {
      res.locals.csrfToken = req.csrfToken()
    }
    next()
  })

  indexRoutes()
  otherRoutes()

  return router
}
