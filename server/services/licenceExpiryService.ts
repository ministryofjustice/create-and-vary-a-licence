import { addDays, isBefore, parse } from 'date-fns'
import LicenceService from './licenceService'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import PrisonerService from './prisonerService'
import { User } from '../@types/CvlUserDetails'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceApiClient from '../data/licenceApiClient'

export default class LicenceExpiryService {
  constructor(
    private readonly prisonerService: PrisonerService,
    private readonly licenceApiClient: LicenceApiClient,
    private readonly licenceService: LicenceService
  ) {}

  /**
   * Filter offender records where a TUSED or SLED exists
   * and is today or in the past
   * @param offenders
   */
  filterPrisonersByEligibleDates(offenders: Prisoner[]): Prisoner[] {
    const tomorrow = addDays(new Date(), 1)
    return offenders.filter(o => {
      if (!o.topupSupervisionExpiryDate && !o.licenceExpiryDate) return false
      const expiryDate = parse(o.topupSupervisionExpiryDate || o.licenceExpiryDate, 'dd/MM/yyyy', new Date())
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
  async expireLicences() {
    const activeLicences = await this.licenceService.getLicencesByNomisIdsAndStatus([], [LicenceStatus.ACTIVE])
    const eligibleNomisLicences = await this.getEligibleNomisLicences(activeLicences.map(l => l.nomisId))
    const expiryList = activeLicences
      .filter(l => eligibleNomisLicences.find(o => o.prisonerNumber === l.nomisId))
      .map(l => l.licenceId)
    if (expiryList.length === 0) return
    await this.licenceApiClient.batchInActivateLicences(expiryList)
  }
}
