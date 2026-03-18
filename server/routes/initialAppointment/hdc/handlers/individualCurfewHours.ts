import { Request, Response } from 'express'
import HdcService from '../../../../services/hdcService'
import DailyCurfewTime from '../types/dailyCurfewTime'
import { SimpleTime } from '../../../manageConditions/types'
import { type Day, DAYS } from '../../../../enumeration/days'
import { CurfewTimes, HdcLicence } from '../../../../@types/licenceApiClientTypes'
import { simpleTimeToMinutes } from '../../../../utils/utils'
import { STANDARD_WEEKLY_CURFEW_TIMES } from '../curfewDefaults'

export default class IndividualCurfewHoursRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (_req: Request, res: Response): Promise<void> => {
    const { licence }: { licence: HdcLicence } = res.locals

    const curfewTimes =
      licence.weeklyCurfewTimes.length > 0
        ? this.buildCurfewTimes(licence.weeklyCurfewTimes)
        : this.buildStandardCurfewTimes()

    res.render('pages/hdc/individualCurfewHours', { days: DAYS, curfewTimes })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    const curfewTimes = req.body.curfews
    await this.hdcService.updateDifferingCurfewTimes(licence.id, curfewTimes, user)
    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
  }

  buildStandardCurfewTimes = (): Record<string, DailyCurfewTime> => {
    const curfewStartTimeMinutes = simpleTimeToMinutes(STANDARD_WEEKLY_CURFEW_TIMES.curfewStart)
    const curfewEndTimeMinutes = simpleTimeToMinutes(STANDARD_WEEKLY_CURFEW_TIMES.curfewEnd)

    const curfews = DAYS.map((day, index) => {
      return [
        index,
        {
          fromTime: STANDARD_WEEKLY_CURFEW_TIMES.curfewStart,
          fromDay: day as Day,
          untilTime: STANDARD_WEEKLY_CURFEW_TIMES.curfewEnd,
          untilDay: (curfewEndTimeMinutes <= curfewStartTimeMinutes ? DAYS[(index + 1) % DAYS.length] : day) as Day,
          sequence: index,
        },
      ]
    })

    return Object.fromEntries(curfews)
  }

  buildCurfewTimes = (curfewTimes: CurfewTimes[]): Record<string, DailyCurfewTime> => {
    const curfews = curfewTimes.map(curfew => {
      return [
        curfew.curfewTimesSequence,
        {
          fromTime: SimpleTime.from24HourString(curfew.fromTime),
          fromDay: curfew.fromDay as Day,
          untilTime: SimpleTime.from24HourString(curfew.untilTime),
          untilDay: curfew.untilDay as Day,
          sequence: curfew.curfewTimesSequence,
        },
      ]
    })

    return Object.fromEntries(curfews)
  }
}
