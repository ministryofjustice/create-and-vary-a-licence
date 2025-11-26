import { RequestHandler, Router } from 'express'
import fetchLicence from '../../../../../middleware/fetchLicenceMiddleware'
import validationMiddleware from '../../../../../middleware/validationMiddleware'
import roleCheckMiddleware from '../../../../../middleware/roleCheckMiddleware'
import timeServedCheckMiddleware from '../../../../../middleware/timeServedCheckMiddleware'

import { Services } from '../../../../../services'
import PersonName from '../../../types/personName'
import InitialMeetingNameRoutes from './initialMeetingName'
import InitialMeetingPlaceRoutes from './initialMeetingPlace'
import PathType from '../../../../../enumeration/pathType'
import UserType from '../../../../../enumeration/userType'
import config from '../../../../../config'
import PostcodeLookupInputValidation from '../../../types/PostcodeLookupInputValidation'
import Address from '../../../types/address'
import SelectAddressRoutes from './selectAddress'
import PostcodeLookupAddress from '../../../types/PostcodeLookupAddress'
import NoAddressFoundRoutes from './noAddressFound'
import ManualAddressPostcodeLookupRoutes from './manualAddressPostcodeLookup'
import ManualAddress from '../../../types/manualAddress'
import InitialMeetingTimeRoutes from './initialMeetingTime'
import DateTime from '../../../types/dateTime'
import ViewAndPrintLicenceRoutes from '../../../../viewingLicences/handlers/viewLicence'
import ConfirmationRoutes from '../../../../creatingLicences/handlers/prisonCreated/confirmation'
import InitialMeetingContactRoutes from './initialMeetingContact'
import TelephoneNumbers from '../../../types/telephoneNumbers'
import { getTimeServerContactProbation } from '../../../../creatingLicences/handlers/prisonCreated/timeServed/contactProbationTeamRoutes'
import { Licence } from '../../../../../@types/licenceApiClientTypes'

export const getEditPath = (pathType: PathType, licence: Licence): string => {
  if (licence.statusCode === 'IN_PROGRESS') {
    return `/licence/time-served/id/${licence.id}/check-your-answers`
  }
  return getTimeServerContactProbation(pathType, licence.id)
}

export default function Index({ licenceService, conditionService, hdcService, addressService }: Services): Router {
  const router = Router()

  const routePrefix = (path: string) => `/licence/time-served${path}`

  /*
   * The fetchLicence middleware will call the licenceAPI during each GET request on the create a licence journey
   * to populate the session with the latest licence.
   * This means that for each page, the licence will already exist in context, and so the handlers will not need
   * to explicitly inject the licence data into their individual view contexts.
   */
  const get = (path: string, handler: RequestHandler, userType: UserType) =>
    router.get(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      timeServedCheckMiddleware(userType),
      handler,
    )

  const post = (path: string, handler: RequestHandler, userType: UserType, type?: new () => object) =>
    router.post(
      routePrefix(path),
      roleCheckMiddleware(['ROLE_LICENCE_CA']),
      fetchLicence(licenceService),
      validationMiddleware(conditionService, type),
      timeServedCheckMiddleware(userType),
      handler,
    )
  {
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-name', controller.GET, UserType.PRISON)
    post('/create/id/:licenceId/initial-meeting-name', controller.POST, UserType.PRISON, PersonName)
  }
  {
    const controller = new InitialMeetingNameRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-name', controller.GET, UserType.PRISON)
    post('/edit/id/:licenceId/initial-meeting-name', controller.POST, UserType.PRISON, PersonName)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-place', controller.GET, UserType.PRISON)
    const addressType = config.postcodeLookupEnabled ? PostcodeLookupInputValidation : Address
    post('/create/id/:licenceId/initial-meeting-place', controller.POST, UserType.PRISON, addressType)
  }
  {
    const controller = new InitialMeetingPlaceRoutes(licenceService, addressService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-place', controller.GET, UserType.PRISON)
    const addressType = config.postcodeLookupEnabled ? PostcodeLookupInputValidation : Address
    post('/edit/id/:licenceId/initial-meeting-place', controller.POST, UserType.PRISON, addressType)
  }
  {
    const controller = new SelectAddressRoutes(addressService, PathType.CREATE)
    get('/create/id/:licenceId/select-address', controller.GET, UserType.PRISON)
    post('/create/id/:licenceId/select-address', controller.POST, UserType.PRISON, PostcodeLookupAddress)
  }
  {
    const controller = new SelectAddressRoutes(addressService, PathType.EDIT)
    get('/edit/id/:licenceId/select-address', controller.GET, UserType.PRISON)
    post('/edit/id/:licenceId/select-address', controller.POST, UserType.PRISON, PostcodeLookupAddress)
  }
  {
    const controller = new NoAddressFoundRoutes(PathType.CREATE)
    get('/create/id/:licenceId/no-address-found', controller.GET, UserType.PRISON)
  }
  {
    const controller = new NoAddressFoundRoutes(PathType.EDIT)
    get('/edit/id/:licenceId/no-address-found', controller.GET, UserType.PRISON)
  }
  {
    const controller = new ManualAddressPostcodeLookupRoutes(addressService, PathType.CREATE)
    get('/create/id/:licenceId/manual-address-entry', controller.GET, UserType.PRISON)
    post('/create/id/:licenceId/manual-address-entry', controller.POST, UserType.PRISON, ManualAddress)
  }
  {
    const controller = new ManualAddressPostcodeLookupRoutes(addressService, PathType.EDIT)
    get('/edit/id/:licenceId/manual-address-entry', controller.GET, UserType.PRISON)
    post('/edit/id/:licenceId/manual-address-entry', controller.POST, UserType.PRISON, ManualAddress)
  }
  {
    const controller = new InitialMeetingContactRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-contact', controller.GET, UserType.PRISON)
    post('/create/id/:licenceId/initial-meeting-contact', controller.POST, UserType.PRISON, TelephoneNumbers)
  }
  {
    const controller = new InitialMeetingContactRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-contact', controller.GET, UserType.PRISON)
    post('/edit/id/:licenceId/initial-meeting-contact', controller.POST, UserType.PRISON, TelephoneNumbers)
  }
  {
    const controller = new InitialMeetingTimeRoutes(licenceService, PathType.CREATE)
    get('/create/id/:licenceId/initial-meeting-time', controller.GET, UserType.PRISON)
    post('/create/id/:licenceId/initial-meeting-time', controller.POST, UserType.PRISON, DateTime)
  }
  {
    const controller = new InitialMeetingTimeRoutes(licenceService, PathType.EDIT)
    get('/edit/id/:licenceId/initial-meeting-time', controller.GET, UserType.PRISON)
    post('/edit/id/:licenceId/initial-meeting-time', controller.POST, UserType.PRISON, DateTime)
  }
  {
    const controller = new ViewAndPrintLicenceRoutes(licenceService, hdcService)
    get('/id/:licenceId/check-your-answers', controller.GET, UserType.PRISON)
    post('/id/:licenceId/check-your-answers', controller.POST, UserType.PRISON)
  }
  {
    const controller = new ConfirmationRoutes()
    get('/id/:licenceId/confirmation', controller.GET, UserType.PRISON)
  }
  return router
}
