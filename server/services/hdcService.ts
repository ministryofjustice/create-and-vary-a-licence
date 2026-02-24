import { User } from '../@types/CvlUserDetails'
import { CurfewTimesRequest, HdcLicenceData } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import CurfewTimes from '../routes/hdc/types/curfewTimes'
import { SimpleTime } from '../routes/manageConditions/types'
import { DAYS, simpleTimeTo24Hour, simpleTimeToMinutes } from '../utils/utils'

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

  async updateCurfewTimes(licenceId: number, curfewTimes: CurfewTimes, user: User): Promise<void> {
    const curfewTimesRequest = this.buildCurfewTimesRequest(curfewTimes.curfewStart, curfewTimes.curfewEnd)
    return this.licenceApiClient.updateCurfewTimes(licenceId, curfewTimesRequest, user)
  }

  buildCurfewTimesRequest = (start: SimpleTime, end: SimpleTime): CurfewTimesRequest => {
    const startMinutes = simpleTimeToMinutes(start)
    const endMinutes = simpleTimeToMinutes(end)

    const spansNextDay = endMinutes <= startMinutes

    const fromTime = simpleTimeTo24Hour(start)
    const untilTime = simpleTimeTo24Hour(end)

    const curfewTimes = DAYS.map((fromDay, sequence) => {
      const nextDayIndex = (sequence + 1) % DAYS.length
      const untilDay = spansNextDay ? DAYS[nextDayIndex] : fromDay

      return {
        curfewTimesSequence: sequence,
        fromDay,
        fromTime,
        untilDay,
        untilTime,
      }
    })

    return { curfewTimes }
  }
}
