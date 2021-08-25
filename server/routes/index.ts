import { Router } from 'express'
import csrf from '../middleware/csrfMiddleware'
import { Services } from '../services'
import createLicenceRoutes from './creatingLicences'
import homeRoutes from './home'
import viewLicenceRoutes from './viewingLicences'
import spikeRoutes from './spikes'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'

export default function Index(services: Services): Router {
  const router = Router({ mergeParams: true })

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(services.userService))
  router.use(csrf())

  router.use(homeRoutes())
  router.use(createLicenceRoutes(services))
  router.use(viewLicenceRoutes(services))
  router.use(spikeRoutes(services))

  return router
}
