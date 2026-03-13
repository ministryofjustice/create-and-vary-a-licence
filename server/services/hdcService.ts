import { User } from '../@types/CvlUserDetails'
import { HdcLicenceData, WeeklyCurfewTimesRequest } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import CurfewTimes from '../routes/initialAppointment/hdc/types/curfewTimes'
import { SimpleTime } from '../routes/manageConditions/types'
import { DAYS, simpleTimeTo24Hour, simpleTimeToMinutes } from '../utils/utils'

export type CvlHdcLicenceData = HdcLicenceData & { allCurfewTimesEqual: boolean }

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getHdcLicenceData(licenceId: number): Promise<CvlHdcLicenceData> {
    const hdcLicenceData = await this.licenceApiClient.getHdcLicenceData(licenceId)
    const allCurfewTimesEqual = hdcLicenceData.weeklyCurfewTimes.every(ct => {
      return (
        ct.fromTime === hdcLicenceData.weeklyCurfewTimes[0].fromTime &&
        ct.untilTime === hdcLicenceData.weeklyCurfewTimes[0].untilTime
      )
    })

    const { curfewAddress, firstNightCurfewTimes, weeklyCurfewTimes } = hdcLicenceData

    return {
      curfewAddress,
      firstNightCurfewTimes,
      weeklyCurfewTimes,
      allCurfewTimesEqual,
    }
  }

  async updateWeeklyCurfewTimes(licenceId: number, curfewTimes: CurfewTimes, user: User): Promise<void> {
    const curfewTimesRequest = this.buildWeeklyCurfewTimesRequest(curfewTimes.curfewStart, curfewTimes.curfewEnd)
    return this.licenceApiClient.updateHdcWeeklyCurfewTimes(licenceId, curfewTimesRequest, user)
  }

  buildWeeklyCurfewTimesRequest = (start: SimpleTime, end: SimpleTime): WeeklyCurfewTimesRequest => {
    const startMinutes = simpleTimeToMinutes(start)
    const endMinutes = simpleTimeToMinutes(end)

    const spansNextDay = endMinutes <= startMinutes

    const fromTime = simpleTimeTo24Hour(start)
    const untilTime = simpleTimeTo24Hour(end)

    const weeklyCurfewTimes = DAYS.map((fromDay, sequence) => {
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

    return { weeklyCurfewTimes }
  }
}
