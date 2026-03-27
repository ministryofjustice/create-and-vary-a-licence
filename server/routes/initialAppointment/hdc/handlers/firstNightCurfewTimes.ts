import { Request, Response } from 'express'
import HdcService from '../../../../services/hdcService'
import { STANDARD_FIRST_NIGHT_CURFEW_TIMES } from '../curfewDefaults'
import { FirstNightCurfewTimesRequest } from '../../../../@types/licenceApiClientTypes'
import { simpleTimeTo24Hour, json24HourTimeTo12HourTime } from '../../../../utils/utils'
import CurfewTimes from '../types/curfewTimes'
import { SimpleTime } from '../../../manageConditions/types'

export default class FirstNightCurfewTimesRoutes {
  constructor(private readonly hdcService: HdcService) {}

  GET = async (_req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const defaults = STANDARD_FIRST_NIGHT_CURFEW_TIMES
    const licenceFirstNightCurfewTimes = licence.firstNightCurfewTimes

    const convert = (time: string) => SimpleTime.fromString(json24HourTimeTo12HourTime(time))

    const curfewStart = licenceFirstNightCurfewTimes
      ? convert(licenceFirstNightCurfewTimes.fromTime)
      : defaults.curfewStart

    const curfewEnd = licenceFirstNightCurfewTimes
      ? convert(licenceFirstNightCurfewTimes.untilTime)
      : defaults.curfewEnd

    res.render('pages/hdc/firstNightCurfewTimes', {
      firstNightCurfewTimes: { curfewStart, curfewEnd },
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals

    await this.hdcService.updateFirstNightCurfewTimes(licence.id, this.mapToFirstNightCurfewRequest(req.body), user)
    return res.redirect(`/licence/create/id/${licence.id}/hdc/standard-curfew-hours-question`)
  }

  mapToFirstNightCurfewRequest = (curfewTimes: CurfewTimes): FirstNightCurfewTimesRequest => ({
    firstNightCurfewTimes: {
      fromTime: simpleTimeTo24Hour(curfewTimes.curfewStart),
      untilTime: simpleTimeTo24Hour(curfewTimes.curfewEnd),
    },
  })
}
