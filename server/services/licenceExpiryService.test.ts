import { format, subDays, addDays } from 'date-fns'
import LicenceStatus from '../enumeration/licenceStatus'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import LicenceType from '../enumeration/licenceType'
import LicenceService from './licenceService'
import LicenceApiClient from '../data/licenceApiClient'
import CommunityService from './communityService'
import LicenceExpiryService from './licenceExpiryService'
import ConditionService from './conditionService'

jest.mock('../data/licenceApiClient')
jest.mock('./communityService')

describe('Expire Licences where TUSED or SLED is today or in the past', () => {
  const today = new Date()
  const todaysDate = format(today, 'dd/MM/yyyy')
  const tomorrowsDate = format(addDays(today, 1), 'dd/MM/yyyy')
  const yesterdaysDate = format(subDays(today, 1), 'dd/MM/yyyy')
  const twoDaysAgo = format(subDays(today, 2), 'dd/MM/yyyy')

  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const conditionService = new ConditionService(licenceApiClient) as jest.Mocked<ConditionService>
  const licenceService = new LicenceService(
    licenceApiClient,
    null,
    communityService,
    conditionService
  ) as jest.Mocked<LicenceService>
  const expireLicenceService = new LicenceExpiryService(licenceApiClient, licenceService)

  const validLicences = [
    {
      licenceId: 1,
      licenceType: LicenceType.PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'ABC123',
      topupSupervisionExpiryDate: yesterdaysDate,
      licenceExpiryDate: null,
    },
    {
      licenceId: 2,
      licenceType: LicenceType.AP,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'ABC124',
      topupSupervisionExpiryDate: null,
      licenceExpiryDate: yesterdaysDate,
    },
    {
      licenceId: 3,
      licenceType: LicenceType.AP_PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'ABC125',
      topupSupervisionExpiryDate: yesterdaysDate,
      licenceExpiryDate: twoDaysAgo,
    },
  ] as LicenceSummary[]

  const inValidLicences = [
    {
      licenceId: 4,
      licenceType: LicenceType.AP_PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'INV123',
      topupSupervisionExpiryDate: tomorrowsDate,
      licenceExpiryDate: yesterdaysDate,
    },
    {
      licenceId: 5,
      licenceType: LicenceType.PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'INV124',
      topupSupervisionExpiryDate: null,
      licenceExpiryDate: tomorrowsDate,
    },
    {
      licenceId: 6,
      licenceType: LicenceType.AP,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'INV125',
      topupSupervisionExpiryDate: todaysDate,
      licenceExpiryDate: null,
    },
  ] as LicenceSummary[]

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Updates eligible licences to expire', async () => {
    licenceApiClient.matchLicences.mockResolvedValue(validLicences.concat(inValidLicences))
    await expireLicenceService.expireLicences()

    expect(licenceApiClient.batchInActivateLicences).toHaveBeenCalledWith([1, 2, 3])
  })

  it('Does not call API where no licences are due to expire', async () => {
    licenceApiClient.matchLicences.mockResolvedValue(inValidLicences)
    await expireLicenceService.expireLicences()

    expect(licenceApiClient.batchInActivateLicences).not.toHaveBeenCalled()
  })
})
