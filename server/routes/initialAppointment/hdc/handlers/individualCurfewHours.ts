import { Request, Response } from 'express'
import STANDARD_CURFEW_TIMES from '../curfewDefaults'
import HdcService from '../../../../services/hdcService'
import DailyCurfewTime from '../types/dailyCurfewTime'
import { SimpleTime } from '../../../manageConditions/types'
import { type Day, DAYS } from '../../../../enumeration/days'
import { CurfewTimes, HdcLicence } from '../../../../@types/licenceApiClientTypes'

export default class IndividualCurfewHoursRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (_req: Request, res: Response): Promise<void> => {
    const { licence }: { licence: HdcLicence } = res.locals

    const curfewTimes =
      licence.curfewTimes.length > 0 ? this.buildCurfewTimes(licence.curfewTimes) : this.buildStandardCurfewTimes()

    res.render('pages/hdc/individualCurfewHours', { days: DAYS, curfewTimes })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    const curfewTimes = req.body.curfews
    await this.hdcService.updateDifferingCurfewTimes(licence.id, curfewTimes, user)
    return res.redirect(`/licence/create/id/${licence.id}/additional-licence-conditions-question`)
  }

  buildStandardCurfewTimes = (): Record<string, DailyCurfewTime> => {
    return DAYS.reduce(
      (curfewTimes, day, index) => {
        curfewTimes[index] = {
          fromTime: STANDARD_CURFEW_TIMES.curfewStart,
          fromDay: day as Day,
          untilTime: STANDARD_CURFEW_TIMES.curfewEnd,
          untilDay: (STANDARD_CURFEW_TIMES.curfewEnd <= STANDARD_CURFEW_TIMES.curfewStart
            ? DAYS[(index + 1) % DAYS.length]
            : day) as Day,
          sequence: index,
        }
        return curfewTimes
      },
      {} as Record<number, DailyCurfewTime>,
    )
  }

  buildCurfewTimes = (curfewTimes: CurfewTimes[]): Record<string, DailyCurfewTime> => {
    return curfewTimes.reduce(
      (curfewTimes, curfew) => {
        curfewTimes[curfew.curfewTimesSequence] = {
          fromTime: SimpleTime.from24HourString(curfew.fromTime),
          fromDay: curfew.fromDay as Day,
          untilTime: SimpleTime.from24HourString(curfew.untilTime),
          untilDay: curfew.untilDay as Day,
          sequence: curfew.curfewTimesSequence,
        }
        return curfewTimes
      },
      {} as Record<number, DailyCurfewTime>,
    )
  }
}
