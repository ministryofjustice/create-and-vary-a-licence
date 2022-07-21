import { addDays, isBefore, parse } from 'date-fns'
import LicenceService from './licenceService'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import PrisonerService from './prisonerService'
import { User } from '../@types/CvlUserDetails'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceApiClient from '../data/licenceApiClient'
import { LicenceSummary } from '../@types/licenceApiClientTypes'
import { LicencesExpired } from '../@types/licencesExpiredSummary'

export default class LicenceExpiryService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly licenceApiClient: LicenceApiClient,
    private readonly licenceService: LicenceService
  ) {}

  /**
   * Filter offender records where a TUSED or SLED exists and is today or in the past.
   * Check for TUSED first, this takes priority over the SLED if present.
   * TUSED is returned for PSS cases only
   * @param offenders
   */
  filterPrisonersByEligibleDates(offenders: Prisoner[]): Prisoner[] {
    const tomorrow = addDays(new Date(), 1)
    return offenders.filter(o => {
      const validExpiry = o.topupSupervisionExpiryDate || o.licenceExpiryDate
      if (!validExpiry) return false
      const expiryDate = parse(validExpiry, 'dd/MM/yyyy', new Date())
      return isBefore(expiryDate, tomorrow)
    })
  }

  /**
   * Get offenders with a valid TUSED or SLED
   * @param nomisIds
   * @param user
   */
  async getEligibleNomisLicences(nomisIds: string[], user?: User): Promise<Prisoner[]> {
    const offenders = await this.prisonerService.searchPrisonersByNomisIds(nomisIds, user)
    return this.filterPrisonersByEligibleDates(offenders)
  }

  /**
   * Expire ACTIVE licences where the
   * SLED (Sentence and Licence Expiry Date) or
   * TUSED (Top Up Supervision Expiry Date)
   * are prior to todays date and  expired
   */
  async expireLicences(): Promise<LicencesExpired> {
    const activeLicences = await this.licenceService.getLicencesByNomisIdsAndStatus([], [LicenceStatus.ACTIVE])
    const eligibleNomisLicences = await this.getEligibleNomisLicences(activeLicences.map(l => l.nomisId))
    const licenceExpiryList = activeLicences.filter(l =>
      eligibleNomisLicences.find(o => o.prisonerNumber === l.nomisId)
    )
    const idList = licenceExpiryList.map(l => l.licenceId)

    if (idList.length === 0) return [] as LicencesExpired

    await this.licenceApiClient.batchInActivateLicences(idList)
    return this.LicencesExpiredSummary(licenceExpiryList, eligibleNomisLicences)
  }

  /**
   * Retrieve licenceId, SLED and TUSED for each licence.
   * licence and sentence data are split between two payloads
   * @param licences
   * @param offenderRecords
   * @constructor
   * @private
   */
  private LicencesExpiredSummary(licences: LicenceSummary[], offenderRecords: Prisoner[]): LicencesExpired {
    return licences.map(l => {
      const offenderRecord = offenderRecords.find(o => o.prisonerNumber === l.nomisId)
      return {
        licenceId: l.licenceId,
        SLED: offenderRecord?.licenceExpiryDate,
        TUSED: offenderRecord?.topupSupervisionExpiryDate,
      }
    })
  }
}
