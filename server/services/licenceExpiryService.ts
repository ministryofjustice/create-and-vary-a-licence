import { parse, startOfDay } from 'date-fns'
import LicenceService from './licenceService'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceApiClient from '../data/licenceApiClient'

export default class LicenceExpiryService {
  constructor(private readonly licenceApiClient: LicenceApiClient, private readonly licenceService: LicenceService) {}

  /**
   * Expire ACTIVE licences where the
   * SLED (Sentence and Licence Expiry Date) or
   * TUSED (Top Up Supervision Expiry Date)
   * are prior to todays date
   */
  async expireLicences(): Promise<void> {
    const activeLicences = await this.licenceService.getLicencesByNomisIdsAndStatus([], [LicenceStatus.ACTIVE])

    const licencesToExpire = activeLicences.filter(l => {
      const expiryDateString = l.topupSupervisionExpiryDate || l.licenceExpiryDate
      if (expiryDateString) {
        const expiryDate = parse(expiryDateString, 'dd/MM/yyyy', new Date())
        return expiryDate < startOfDay(new Date())
      }

      return false
    })

    const idList = licencesToExpire.map(l => l.licenceId)

    if (idList.length) {
      await this.licenceApiClient.batchInActivateLicences(idList)
    }
  }
}
