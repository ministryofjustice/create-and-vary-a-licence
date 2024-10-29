import { HdcLicenceData } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getHdcLicenceData(licenceId: number): Promise<HdcLicenceData> {
    const hdcLicenceData = await this.licenceApiClient.getHdcLicenceData(licenceId)

    const { curfewAddress, firstNightCurfewHours, curfewTimes } = hdcLicenceData

    return {
      curfewAddress,
      firstNightCurfewHours,
      curfewTimes,
    }
  }
}
