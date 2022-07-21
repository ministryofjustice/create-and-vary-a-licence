import { format, subDays, addDays } from 'date-fns'
import LicenceStatus from '../enumeration/licenceStatus'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import LicenceType from '../enumeration/licenceType'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import LicenceService from './licenceService'
import LicenceApiClient from '../data/licenceApiClient'
import PrisonerService from './prisonerService'
import CommunityService from './communityService'
import LicenceExpiryService from './licenceExpiryService'
import { LicencesExpired } from '../@types/licencesExpiredSummary'

jest.mock('../data/licenceApiClient')
jest.mock('./communityService')
jest.mock('./prisonerService')

describe('Expire Licences where TUSED or SLED is today or in the past', () => {
  const today = new Date()
  const todaysDate = format(today, 'dd/MM/yyyy')
  const tomorrowsDate = format(addDays(today, 2), 'dd/MM/yyyy')
  const yesterdaysDate = format(subDays(today, 1), 'dd/MM/yyyy')

  const licenceApiClient = new LicenceApiClient() as jest.Mocked<LicenceApiClient>
  const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>
  const communityService = new CommunityService(null, null) as jest.Mocked<CommunityService>
  const licenceService = new LicenceService(licenceApiClient, prisonerService, communityService) as LicenceService
  const expireLicenceService = new LicenceExpiryService(prisonerService, licenceApiClient, licenceService)

  const validLicences: Array<LicenceSummary> = [
    {
      licenceId: 1,
      licenceType: LicenceType.PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'ABC123',
    },
    {
      licenceId: 2,
      licenceType: LicenceType.AP,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'ABC124',
    },
    {
      licenceId: 3,
      licenceType: LicenceType.AP_PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'ABC125',
    },
  ]

  const inValidLicences: Array<LicenceSummary> = [
    {
      licenceId: 4,
      licenceType: LicenceType.AP_PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'INV123',
    },
    {
      licenceId: 5,
      licenceType: LicenceType.PSS,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'INV124',
    },
    {
      licenceId: 6,
      licenceType: LicenceType.AP,
      licenceStatus: LicenceStatus.ACTIVE,
      nomisId: 'INV125',
    },
  ]

  const validPrisoners: Array<Prisoner> = [
    {
      // PPS record
      prisonerNumber: 'ABC123',
      topupSupervisionExpiryDate: undefined,
      licenceExpiryDate: todaysDate,
      restrictedPatient: false,
    },
    {
      // AP record
      prisonerNumber: 'ABC124',
      topupSupervisionExpiryDate: null,
      licenceExpiryDate: yesterdaysDate,
      restrictedPatient: false,
    },
    {
      // AP_PSS record
      prisonerNumber: 'ABC125',
      topupSupervisionExpiryDate: yesterdaysDate,
      licenceExpiryDate: yesterdaysDate,
      restrictedPatient: false,
    },
  ]

  const invalidPrisoners: Array<Prisoner> = [
    {
      // invalid PPS record
      prisonerNumber: 'INV123',
      topupSupervisionExpiryDate: tomorrowsDate,
      licenceExpiryDate: tomorrowsDate,
      restrictedPatient: false,
    },
    {
      // invalid AP record
      prisonerNumber: 'INV124',
      topupSupervisionExpiryDate: null,
      licenceExpiryDate: tomorrowsDate,
      restrictedPatient: false,
    },
    {
      // invalid AP_PSS record
      prisonerNumber: 'INV125',
      topupSupervisionExpiryDate: tomorrowsDate,
      licenceExpiryDate: tomorrowsDate,
      restrictedPatient: false,
    },
  ]

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('Filters offenders with no TUSED or SLED being for today or in the past', async () => {
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue(validPrisoners.concat(invalidPrisoners))
    licenceApiClient.matchLicences.mockResolvedValue(validLicences.concat(inValidLicences))
    const result = (await expireLicenceService.getEligibleNomisLicences(expect.any(Array), null)) as Array<Prisoner>
    expect(result).toEqual(validPrisoners)
  })

  it('Updates eligible licences to expire', async () => {
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue(validPrisoners.concat(invalidPrisoners))
    licenceApiClient.matchLicences.mockResolvedValue(validLicences.concat(inValidLicences))
    const summary = await expireLicenceService.expireLicences()
    expect(licenceApiClient.batchInActivateLicences).toBeCalledWith(validLicences.map(l => l.licenceId))
    expect(summary).toEqual([
      { licenceId: 1, SLED: todaysDate, TUSED: undefined },
      { licenceId: 2, SLED: yesterdaysDate, TUSED: null },
      { licenceId: 3, SLED: yesterdaysDate, TUSED: yesterdaysDate },
    ] as LicencesExpired)
  })

  it('Does not call API where no licences are due to expire', async () => {
    prisonerService.searchPrisonersByNomisIds.mockResolvedValue(invalidPrisoners)
    licenceApiClient.matchLicences.mockResolvedValue(inValidLicences)
    const summary = await expireLicenceService.expireLicences()
    expect(summary).toEqual([] as LicencesExpired)
    expect(licenceApiClient.batchInActivateLicences).not.toHaveBeenCalled()
  })
})
