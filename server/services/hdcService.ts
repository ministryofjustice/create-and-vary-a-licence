import { User } from '../@types/CvlUserDetails'
import { HdcWeeklyCurfewTimesRequest, HdcLicenceData } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import CurfewTimes from '../routes/initialAppointment/hdc/types/curfewTimes'
import { SimpleTime } from '../routes/manageConditions/types'
import { DAYS, simpleTimeTo24Hour, simpleTimeToMinutes } from '../utils/utils'

export type CvlHdcLicenceData = HdcLicenceData & { allCurfewTimesEqual: boolean }

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getHdcLicenceData(licenceId: number): Promise<CvlHdcLicenceData> {
    const hdcLicenceData = await this.licenceApiClient.getHdcLicenceData(licenceId)
    const allCurfewTimesEqual = hdcLicenceData.hdcWeeklyCurfewTimes.every(ct => {
      return (
        ct.fromTime === hdcLicenceData.hdcWeeklyCurfewTimes[0].fromTime &&
        ct.untilTime === hdcLicenceData.hdcWeeklyCurfewTimes[0].untilTime
      )
    })

    const { curfewAddress, hdcFirstNightCurfewHours, hdcWeeklyCurfewTimes } = hdcLicenceData

    return {
      curfewAddress,
      hdcFirstNightCurfewHours,
      hdcWeeklyCurfewTimes,
      allCurfewTimesEqual,
    }
  }

  async updateHdcWeeklyCurfewTimes(licenceId: number, curfewTimes: CurfewTimes, user: User): Promise<void> {
    const curfewTimesRequest = this.buildHdcWeeklyCurfewTimesRequest(curfewTimes.curfewStart, curfewTimes.curfewEnd)
    return this.licenceApiClient.updateHdcWeeklyCurfewTimes(licenceId, curfewTimesRequest, user)
  }

  buildHdcWeeklyCurfewTimesRequest = (start: SimpleTime, end: SimpleTime): HdcWeeklyCurfewTimesRequest => {
    const startMinutes = simpleTimeToMinutes(start)
    const endMinutes = simpleTimeToMinutes(end)

    const spansNextDay = endMinutes <= startMinutes

    const fromTime = simpleTimeTo24Hour(start)
    const untilTime = simpleTimeTo24Hour(end)

    const hdcWeeklyCurfewTimes = DAYS.map((fromDay, sequence) => {
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

    return { hdcWeeklyCurfewTimes }
  }
}
