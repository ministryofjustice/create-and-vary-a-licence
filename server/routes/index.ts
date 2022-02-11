import { Router } from 'express'
import csrf from '../middleware/csrfMiddleware'
import { Services } from '../services'
import createLicenceRoutes from './creatingLicences'
import varyLicenceRoutes from './varyingLicences'
import approveLicenceRoutes from './approvingLicences'
import homeRoutes from './home'
import rolloutRoutes from './rollout'
import viewLicenceRoutes from './viewingLicences'
import spikeRoutes from './spikes'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'
import rolloutMiddleware from '../middleware/rolloutMiddleware'
import flashMessages from '../middleware/flashMessageMiddleware'
import fromReviewMiddleware from '../middleware/fromReviewMiddleware'

export default function Index(services: Services): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(services.userService, services.licenceService))
  router.use(rolloutMiddleware())
  router.use(csrf())
  router.use(flashMessages())
  router.use(fromReviewMiddleware())

  router.use(homeRoutes())
  router.use(rolloutRoutes())
  router.use(createLicenceRoutes(services))
  router.use(varyLicenceRoutes(services))
  router.use(approveLicenceRoutes(services))
  router.use(viewLicenceRoutes(services))
  router.use(spikeRoutes(services))

  return router
}
