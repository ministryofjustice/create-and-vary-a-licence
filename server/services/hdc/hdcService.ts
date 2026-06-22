import { User } from '../../@types/CvlUserDetails'
import {
  CurfewTimes as ApiCurfewTimes,
  FirstNightCurfewTimesRequest,
  Licence,
  WeeklyCurfewTimesRequest,
} from '../../@types/licenceApiClientTypes'
import LicenceApiClient from '../../data/licenceApiClient'
import CurfewTimes from '../../routes/initialAppointment/hdc/types/curfewTimes'
import { Day, DAYS } from '../../enumeration/days'
import DailyCurfewTime from '../../routes/initialAppointment/hdc/types/dailyCurfewTime'
import { SimpleTime } from '../../routes/manageConditions/types'
import { simpleTimeTo24Hour, simpleTimeToMinutes } from '../../utils/utils'
import { STANDARD_WEEKLY_CURFEW_TIMES } from '../../utils/curfewDefaults'

export default class HdcService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async updateFirstNightCurfewTimes(
    licenceId: number,
    request: FirstNightCurfewTimesRequest,
    user: User,
  ): Promise<void> {
    return this.licenceApiClient.updateHdcFirstNightCurfewTimes(licenceId, request, user)
  }

  async updateWeeklyCurfewTimes(licenceId: number, curfewTimes: CurfewTimes, user: User): Promise<void> {
    const curfewTimesRequest = this.buildWeeklyCurfewTimesRequest(curfewTimes.curfewStart, curfewTimes.curfewEnd)
    return this.licenceApiClient.updateHdcWeeklyCurfewTimes(licenceId, curfewTimesRequest, user)
  }

  async updateDifferingCurfewTimes(licenceId: number, curfewTimes: DailyCurfewTime[], user: User): Promise<void> {
    console.log('curfewTimes', curfewTimes)
    const curfewTimesRequest = this.buildDifferingCurfewTimesRequest(curfewTimes)
    console.log('curfewTimesRequest-->', curfewTimesRequest)
    return this.licenceApiClient.updateHdcWeeklyCurfewTimes(licenceId, curfewTimesRequest, user)
  }

  getCurfewTimes(curfewTimes: ApiCurfewTimes[]): Record<string, DailyCurfewTime> {
    if (curfewTimes.length === 0) {
      return this.buildStandardCurfewTimesDisplayObject()
    }
    return this.buildCurfewTimesDisplayObject(curfewTimes)
  }

  async isVariationOfHdcMigration(licence: Licence, user: User): Promise<boolean> {
    if (licence.kind !== 'HDC_VARIATION') {
      return false
    }
    const hdcVariationParent = await this.licenceApiClient.getLicenceById(licence.variationOf, user)

    return hdcVariationParent.kind === 'HDC' && hdcVariationParent.isHdcMigration
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
        fromDay: curfew.startDay,
        fromTime: simpleTimeTo24Hour(curfew.startTime),
        untilDay: curfew.endDay,
        untilTime: simpleTimeTo24Hour(curfew.endTime),
      }
    })

    return { weeklyCurfewTimes: requestObject }
  }

  buildCurfewTimesDisplayObject(curfewTimes: ApiCurfewTimes[]): Record<string, DailyCurfewTime> {
    const curfews = curfewTimes.map(curfew => {
      return [
        curfew.curfewTimesSequence,
        {
          startTime: SimpleTime.from24HourString(curfew.fromTime),
          startDay: curfew.fromDay as Day,
          endTime: SimpleTime.from24HourString(curfew.untilTime),
          endDay: curfew.untilDay as Day,
          sequence: curfew.curfewTimesSequence,
        },
      ]
    })

    return Object.fromEntries(curfews)
  }

  buildStandardCurfewTimesDisplayObject(): Record<string, DailyCurfewTime> {
    const curfewStartTimeMinutes = simpleTimeToMinutes(STANDARD_WEEKLY_CURFEW_TIMES.curfewStart)
    const curfewEndTimeMinutes = simpleTimeToMinutes(STANDARD_WEEKLY_CURFEW_TIMES.curfewEnd)

    const curfews = DAYS.map((day, index) => {
      return [
        index,
        {
          startTime: STANDARD_WEEKLY_CURFEW_TIMES.curfewStart,
          startDay: day as Day,
          endTime: STANDARD_WEEKLY_CURFEW_TIMES.curfewEnd,
          endDay: (curfewEndTimeMinutes <= curfewStartTimeMinutes ? DAYS[(index + 1) % DAYS.length] : day) as Day,
          sequence: index,
        },
      ]
    })

    return Object.fromEntries(curfews)
  }
}
