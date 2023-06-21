import type { User } from '../@types/CvlUserDetails'
import LicenceApiClient from '../data/licenceApiClient'
import LicenceStatus from '../enumeration/licenceStatus'
import { LicenceDates } from '../@types/licenceDates'

export default class LicenceOverrideService {
  constructor(private licenceApiClient: LicenceApiClient) {}

  async overrideStatusCode(licenceId: number, statusCode: LicenceStatus, reason: string, user: User) {
    const request = {
      statusCode,
      reason,
    }
    await this.licenceApiClient.overrideStatusCode(licenceId, request, user)
  }

  async overrideDates(licenceId: number, dates: LicenceDates, reason: string, user: User) {
    await this.licenceApiClient.overrideLicenceDates(licenceId, dates, reason, user)
  }
}
