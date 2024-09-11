import { HdcLicenceData } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getHdcLicenceData(bookingId: number): Promise<HdcLicenceData> {
    const hdcLicenceData = await this.licenceApiClient.getHdcLicenceData(bookingId)

    const { curfewAddress, firstNightCurfewHours, curfewHours } = hdcLicenceData

    return {
      curfewAddress,
      firstNightCurfewHours,
      curfewHours,
    }
  }
}
