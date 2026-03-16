import { User } from '../@types/CvlUserDetails'
import { HdcLicenceData, WeeklyCurfewTimesRequest } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import CurfewTimes from '../routes/initialAppointment/hdc/types/curfewTimes'
import { DAYS } from '../enumeration/days'
import DailyCurfewTime from '../routes/initialAppointment/hdc/types/dailyCurfewTime'
import { SimpleTime } from '../routes/manageConditions/types'
import { simpleTimeTo24Hour, simpleTimeToMinutes } from '../utils/utils'

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

  async updateDifferingCurfewTimes(licenceId: number, curfewTimes: DailyCurfewTime[], user: User): Promise<void> {
    const curfewTimesRequest = this.buildDifferingCurfewTimesRequest(curfewTimes)
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

  buildDifferingCurfewTimesRequest = (curfewTimes: DailyCurfewTime[]): WeeklyCurfewTimesRequest => {
    const requestObject = curfewTimes.map(curfew => {
      return {
        curfewTimesSequence: curfew.sequence,
        fromDay: curfew.fromDay,
        fromTime: simpleTimeTo24Hour(curfew.fromTime),
        untilDay: curfew.untilDay,
        untilTime: simpleTimeTo24Hour(curfew.untilTime),
      }
    })

    return { weeklyCurfewTimes: requestObject }
  }
}
