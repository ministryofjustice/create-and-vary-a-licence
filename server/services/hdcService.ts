import { HdcLicenceData } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export type CvlHdcLicenceData = HdcLicenceData & { allCurfewTimesEqual: boolean }

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getHdcLicenceData(licenceId: number): Promise<CvlHdcLicenceData> {
    const hdcLicenceData = await this.licenceApiClient.getHdcLicenceData(licenceId)
    const allCurfewTimesEqual = hdcLicenceData.curfewTimes.every(ct => {
      return (
        ct.fromTime === hdcLicenceData.curfewTimes[0].fromTime &&
        ct.untilTime === hdcLicenceData.curfewTimes[0].untilTime
      )
    })

    const { curfewAddress, firstNightCurfewHours, curfewTimes } = hdcLicenceData

    return {
      curfewAddress,
      firstNightCurfewHours,
      curfewTimes,
      allCurfewTimesEqual,
    }
  }
}
