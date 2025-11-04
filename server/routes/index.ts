import { Router } from 'express'
import { Services } from '../services'
import createLicenceRoutes from './creatingLicences'
import createHardStopLicenceRoutes from './creatingLicences/handlers/hardStop'
import createHdcLicenceRoutes from './creatingLicences/handlers/hdc'
import createRecallLicenceRoutes from './creatingLicences/handlers/recall'
import manageConditionRoutes from './manageConditions'
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
import PrisonerController from './prisonerController'
import searchRoutes from './search'
import initialAppointmentRoutes from './initialAppointment'
import hardStopInitialAppointmentRoutes from './initialAppointment/handlers/hardStop'
import pathfinderRoutes from './manageConditions/handlers/pathfinder'
import dprRoutes from './reporting'
import staffRoutes from './staff'
import hardStopStaffRoutes from './initialAppointment/handlers/hardStop/staff'
import createTimeServedLicenceRoutes from './creatingLicences/handlers/timeServed'

export default function Index(services: Services): Router {
  const router = Router({ mergeParams: true })
  const prisonerController = new PrisonerController(services.prisonerService)

  router.use(auth.authenticationMiddleware(tokenVerifier))
  router.use(populateCurrentUser(services.userService, services.licenceService))
  router.use(flashMessages())
  router.use(fromReviewMiddleware())

  router.use(homeRoutes())
  router.use(rolloutRoutes())
  router.use(createLicenceRoutes(services))
  router.use(createHardStopLicenceRoutes(services))
  router.use(createHdcLicenceRoutes(services))
  router.use(createRecallLicenceRoutes(services))
  router.use(manageConditionRoutes(services))
  router.use(varyLicenceRoutes(services))
  router.use(approveLicenceRoutes(services))
  router.use(viewLicenceRoutes(services))
  router.use(approveVariationsLicenceRoutes(services))
  router.use(supportRoutes(services))
  router.use(changeLocationRoutes(services))
  router.use(changeTeamRoutes(services))
  router.use(searchRoutes(services))
  router.use(initialAppointmentRoutes(services))
  router.use(staffRoutes(services))
  router.use(hardStopStaffRoutes(services))
  router.use(hardStopInitialAppointmentRoutes(services))
  router.use(pathfinderRoutes(services))
  router.use(dprRoutes(services))
  router.use(createTimeServedLicenceRoutes(services))

  router.get('/prisoner/:nomsId/image', prisonerController.getImage())

  return router
}
