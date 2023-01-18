import LicenceApiClient from '../data/licenceApiClient'
import LicenceStatus from '../enumeration/licenceStatus'

export default class LicenceOverrideService {
  constructor(private licenceApiClient: LicenceApiClient) {}

  async overrideStatusCode(licenceId: number, statusCode: LicenceStatus, reason: string) {
    const request = {
      statusCode,
      reason,
    }
    await this.licenceApiClient.overrideStatusCode(licenceId, request)
  }
}
