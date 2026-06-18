import { RequestHandler, Router } from 'express'
import { Services } from '../../../services'
import roleCheckMiddleware from '../../../middleware/roleCheckMiddleware'
import { alterResObject } from '..'
import checkComCaseAccessMiddleware from '../../../middleware/checkComCaseAccessMiddleware'
import fetchLicence from '../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../middleware/validationMiddleware'
import AccommodationTypeQuestionRoutes from './handlers/accommodationTypeQuestion'
import ResidentialChecksCompletedQuestionRoutes from './handlers/residentialChecksCompletedQuestion'
import YesOrNoQuestion from '../../creatingLicences/types/yesOrNo'
import ResidentialChecksIncompleteReasonRoutes from './handlers/residentialChecksIncompleteReason'
import ReasonForIncompleteAddressChecks from '../types/reasonForIncompleteAddressChecks'
import PostcodeLookupInputValidation from '../../initialAppointment/types/PostcodeLookupInputValidation'
import NoCurfewAddressFoundRoutes from './handlers/noCurfewAddressFound'
import FindNewCurfewAddressRoutes from './handlers/findNewCurfewAddress'
import SelectCurfewAddressRoutes from './handlers/selectCurfewAddress'
import ManualAddressEntryRoutes from './handlers/manualAddressEntry'
import ManualCurfewAddress from '../types/manualCurfewAddress'
import CurfewAccommodationTypeQuestion from '../types/curfewAccommodationType'
import StandardCurfewHoursQuestionRoutes from './handlers/standardCurfewHoursQuestion'
import DoHdcCurfewHoursApplyDailyRoutes from './handlers/doHdcCurfewHoursApplyDaily'
import IndividualCurfewHoursRoutes from './handlers/individualCurfewHours'
import DailyCurfewTimes from '../../initialAppointment/hdc/types/dailyCurfewTimes'

export default function Index(services: Services): Router {
  const { conditionService, licenceService, hdcCurfewAddressService, hdcService, addressService } = services
  const router = Router()

  const routePrefix = (path: string) => `/licence/vary/id/:licenceId/hdc${path}`

  const get = (path: string, handler: RequestHandler) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      alterResObject(),
      checkComCaseAccessMiddleware(licenceService),
      fetchLicence(licenceService),
      handler,
    )

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_RO']),
      checkComCaseAccessMiddleware(licenceService),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )

  {
    const controller = new AccommodationTypeQuestionRoutes()
    get('/accommodation-type-question', controller.GET)
    post('/accommodation-type-question', controller.POST, CurfewAccommodationTypeQuestion)
  }

  {
    const contoller = new ResidentialChecksCompletedQuestionRoutes(hdcCurfewAddressService)
    get('/address-checks', contoller.GET)
    post('/address-checks', contoller.POST, YesOrNoQuestion)
  }

  {
    const controller = new ResidentialChecksIncompleteReasonRoutes(hdcCurfewAddressService)
    get('/residential-checks-incomplete', controller.GET)
    post('/residential-checks-incomplete', controller.POST, ReasonForIncompleteAddressChecks)
  }

  {
    const controller = new FindNewCurfewAddressRoutes()
    get('/find-the-new-curfew-address', controller.GET)
    post('/find-the-new-curfew-address', controller.POST, PostcodeLookupInputValidation)
  }

  {
    const controller = new NoCurfewAddressFoundRoutes()
    get('/no-curfew-address-found', controller.GET)
  }

  {
    const controller = new SelectCurfewAddressRoutes(addressService, hdcCurfewAddressService)
    get('/select-curfew-address', controller.GET)
    post('/select-curfew-address', controller.POST)
  }

  {
    const controller = new ManualAddressEntryRoutes(hdcCurfewAddressService)
    get('/manual-curfew-address-entry', controller.GET)
    post('/manual-curfew-address-entry', controller.POST, ManualCurfewAddress)
  }

  {
    const controller = new StandardCurfewHoursQuestionRoutes(hdcService)
    get('/standard-curfew-hours-question', controller.GET)
    post('/standard-curfew-hours-question', controller.POST, YesOrNoQuestion)
  }

  {
    const controller = new DoHdcCurfewHoursApplyDailyRoutes()
    get('/do-hdc-curfew-hours-apply-daily', controller.GET)
    post('/do-hdc-curfew-hours-apply-daily', controller.POST, YesOrNoQuestion)
  }

  {
    const controller = new IndividualCurfewHoursRoutes(hdcService)
    get('/individual-curfew-hours', controller.GET)
    post('/individual-curfew-hours', controller.POST, DailyCurfewTimes)
  }

  return router
}
