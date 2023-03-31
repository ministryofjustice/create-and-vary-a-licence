import { Router } from 'express'
import csrf from '../middleware/csrfMiddleware'
import { Services } from '../services'
import createLicenceRoutes from './creatingLicences'
import varyLicenceRoutes from './varyingLicences'
import approveLicenceRoutes from './approvingLicences'
import homeRoutes from './home'
import rolloutRoutes from './rollout'
import viewLicenceRoutes from './viewingLicences'
import approveVariationsLicenceRoutes from './approvingVariations'
import supportRoutes from './support'
import changeLocationRoutes from './changeLocation'
import changeTeamRoutes from './changeTeam'
import auth from '../authentication/auth'
import tokenVerifier from '../data/tokenVerification'
import populateCurrentUser from '../middleware/populateCurrentUser'
import flashMessages from '../middleware/flashMessageMiddleware'
import fromReviewMiddleware from '../middleware/fromReviewMiddleware'
import config from '../config'

export default function Index(services: Services): Router {
  const router = Router({ mergeParams: true })

  if (config.serviceIsUnvailable) {
    router.all('*', (req, res) => {
      res.render('service-unavailable.njk')
    })
  }

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(services.userService, services.licenceService))
  router.use(csrf())
  router.use(flashMessages())
  router.use(fromReviewMiddleware())

  router.use(homeRoutes())
  router.use(rolloutRoutes())
  router.use(createLicenceRoutes(services))
  router.use(varyLicenceRoutes(services))
  router.use(approveLicenceRoutes(services))
  router.use(viewLicenceRoutes(services))
  router.use(approveVariationsLicenceRoutes(services))
  router.use(supportRoutes(services))
  router.use(changeLocationRoutes(services))
  router.use(changeTeamRoutes(services))

  return router
}
