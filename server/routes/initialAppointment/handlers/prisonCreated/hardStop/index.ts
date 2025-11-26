import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../../middleware/roleCheckMiddleware'

import { Services } from '../../../../../services'
import PersonName from '../../../types/personName'
import InitialMeetingNameRoutes from './initialMeetingName'
import Address from '../../../types/address'
import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import InitialMeetingContactRoutes from './initialMeetingContact'
import TelephoneNumbers from '../../../types/telephoneNumbers'
import InitialMeetingTimeRoutes from './initialMeetingTime'
import DateTime from '../../../types/dateTime'
import ViewAndPrintLicenceRoutes from '../../../../viewingLicences/handlers/viewLicence'
import ConfirmationRoutes from '../../../../creatingLicences/handlers/prisonCreated/confirmation'
import PathType from '../../../../../enumeration/pathType'
import config from '../../../../../config'
import PostcodeLookupAddress from '../../../types/PostcodeLookupAddress'
import SelectAddressRoutes from './selectAddress'
import PostcodeLookupInputValidation from '../../../types/PostcodeLookupInputValidation'
import NoAddressFoundRoutes from './noAddressFound'
import ManualAddressPostcodeLookupRoutes from './manualAddressPostcodeLookup'
import ManualAddress from '../../../types/manualAddress'

export default function Index({ licenceService, conditionService, hdcService, addressService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/hard-stop${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler) =>
    router.get(routePrefix(path), roleCheckMiddleware(['ROLE_LICENCE_CA']), fetchLicence(licenceService), handler)

  const post = (path: string, handler: RequestHandler, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      handler,
    )
  {
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-name', controller.GET)
    post('/create/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }
  {
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-name', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-name', controller.POST, PersonName)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-place', controller.GET)
    const addressType = config.postcodeLookupEnabled ? PostcodeLookupInputValidation : Address
    post('/create/id/:licenceId/initial-meeting-place', controller.POST, addressType)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-place', controller.GET)
    const addressType = config.postcodeLookupEnabled ? PostcodeLookupInputValidation : Address
    post('/edit/id/:licenceId/initial-meeting-place', controller.POST, addressType)
  }
  {
    const controller = new SelectAddressRoutes(addressService, PathType.CREATE)
    get('/create/id/:licenceId/select-address', controller.GET)
    post('/create/id/:licenceId/select-address', controller.POST, PostcodeLookupAddress)
  }
  {
    const controller = new SelectAddressRoutes(addressService, PathType.EDIT)
    get('/edit/id/:licenceId/select-address', controller.GET)
    post('/edit/id/:licenceId/select-address', controller.POST, PostcodeLookupAddress)
  }
  {
    const controller = new NoAddressFoundRoutes(PathType.CREATE)
    get('/create/id/:licenceId/no-address-found', controller.GET)
  }
  {
    const controller = new NoAddressFoundRoutes(PathType.EDIT)
    get('/edit/id/:licenceId/no-address-found', controller.GET)
  }
  {
    const controller = new ManualAddressPostcodeLookupRoutes(addressService, PathType.CREATE)
    get('/create/id/:licenceId/manual-address-entry', controller.GET)
    post('/create/id/:licenceId/manual-address-entry', controller.POST, ManualAddress)
  }
  {
    const controller = new ManualAddressPostcodeLookupRoutes(addressService, PathType.EDIT)
    get('/edit/id/:licenceId/manual-address-entry', controller.GET)
    post('/edit/id/:licenceId/manual-address-entry', controller.POST, ManualAddress)
  }
  {
    const controller = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/create/id/:licenceId/initial-meeting-contact', controller.POST, TelephoneNumbers)
  }
  {
    const controller = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-contact', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-contact', controller.POST, TelephoneNumbers)
  }
  {
    const controller = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-time', controller.GET)
    post('/create/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }
  {
    const controller = new InitialMeetingTimeRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-time', controller.GET)
    post('/edit/id/:licenceId/initial-meeting-time', controller.POST, DateTime)
  }
  {
    const controller = new ViewAndPrintLicenceRoutes(licenceService, hdcService)
    get('/id/:licenceId/check-your-answers', controller.GET)
    post('/id/:licenceId/check-your-answers', controller.POST)
  }
  {
    const controller = new ConfirmationRoutes()
    get('/id/:licenceId/confirmation', controller.GET)
  }
  return router
}
