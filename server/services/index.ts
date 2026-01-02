import { createDprServices } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/utils/CreateDprServices'

import UserService from './userService'
import PrisonerService from './prisonerService'
import LicenceService from './licenceService'
import ProbationService from './probationService'
import QrCodeService from './qrCodeService'
import VaryApproverCaseloadService from './lists/varyApproverCaseloadService'
import UkBankHolidayFeedService from './ukBankHolidayFeedService'
import PrisonRegisterService from './prisonRegisterService'
import ConditionService from './conditionService'
import LicenceOverrideService from './licenceOverrideService'
import { dataAccess } from '../data'
import SearchService from './searchService'
import FeComponentsService from './feComponentsService'
import ApproverCaseloadService from './lists/approverCaseloadService'
import TimelineService from './timelineService'
import CaCaseloadService from './lists/caCaseloadService'
import ComCaseloadService from './lists/comCaseloadService'
import HdcService from './hdcService'
import DprService from './dprService'
import AddressService from './addressService'
import TimeServedService from './timeServedService'

const {
  manageUsersApiClient,
  prisonApiClient,
  prisonerSearchApiClient,
  deliusClient,
  licenceApiClient,
  prisonRegisterApiClient,
  feComponentsClient,

  // dpr components
  reportingClient,
  dashboardClient,
  reportDataStore,
  productCollectionClient,
  missingReportClient,
} = dataAccess()

const dprServices = createDprServices({
  reportingClient,
  dashboardClient,
  reportDataStore,
  productCollectionClient,
  missingReportClient,
})

const qrCodeService = new QrCodeService()
const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)
const probationService = new ProbationService(deliusClient)
const userService = new UserService(manageUsersApiClient, prisonApiClient, probationService)
const conditionService = new ConditionService(licenceApiClient)
const licenceService = new LicenceService(licenceApiClient, conditionService)
const ukBankHolidayFeedService = new UkBankHolidayFeedService()
const varyApproverCaseloadService = new VaryApproverCaseloadService(licenceApiClient)
const caCaseloadService = new CaCaseloadService(licenceApiClient)
const comCaseloadService = new ComCaseloadService(licenceService, licenceApiClient)
const approvedCaseloadService = new ApproverCaseloadService(licenceApiClient)
const prisonRegisterService = new PrisonRegisterService(prisonRegisterApiClient)
const licenceOverrideService = new LicenceOverrideService(licenceApiClient)
const searchService = new SearchService(licenceApiClient)
const timelineService = new TimelineService(licenceApiClient)
const feComponentsService = new FeComponentsService(feComponentsClient)
const hdcService = new HdcService(licenceApiClient)
const dprService = new DprService(licenceApiClient)
const addressService = new AddressService(licenceApiClient)
const timeServedService = new TimeServedService(licenceApiClient)

export const services = {
  userService,
  licenceService,
  approvedCaseloadService,
  caCaseloadService,
  comCaseloadService,
  varyApproverCaseloadService,
  prisonerService,
  probationService,
  qrCodeService,
  ukBankHolidayFeedService,
  prisonRegisterService,
  conditionService,
  licenceOverrideService,
  searchService,
  licenceApiClient,
  feComponentsService,
  timelineService,
  hdcService,
  dprService,
  addressService,
  timeServedService,
  ...dprServices,
}

export type Services = typeof services
