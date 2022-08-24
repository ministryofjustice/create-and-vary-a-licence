import { Request, Response } from 'express'
import { Parser } from 'json2csv'
import { getTime } from 'date-fns'

import LicenceService from '../../../services/licenceService'

export default class LicenceStatisticsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const startDate = req.flash('startDate')[0]
    const endDate = req.flash('endDate')[0]
    const dateOrderMessage = req.flash('dateOrderMessage')[0]

    return res.render('pages/support/licenceStatistics', { startDate, endDate, dateOrderMessage })
  }

  POST = async (req: Request, res: Response) => {
    const { user } = res.locals
    const { startDate, endDate } = req.body

    if (this.isStartBeforeEnd(startDate, endDate)) {
      const fields = [
        {
          label: 'Metric',
          value: 'metric',
        },
        {
          label: 'Licence type',
          value: 'licenceType',
        },
        {
          label: 'Prison',
          value: 'prison',
        },
        {
          label: 'Region',
          value: 'region',
        },
        {
          label: 'PDU',
          value: 'pdu',
        },
        {
          label: 'Team',
          value: 'team',
        },
      ]
      const json2csvParser = new Parser({ fields })
      const licenceStatistics = await this.licenceService.getlicenceStatistics(startDate, endDate, user)
      const csv = json2csvParser.parse(licenceStatistics)

      res.setHeader('content-type', 'text/csv')
      return res.send(csv)
    }

    // if endDate before startDate
    req.flash('startDate', startDate)
    req.flash('endDate', endDate)
    req.flash('dateOrderMessage', 'End date must be after start date')
    return res.redirect('/support/licence-statistics')
  }

  isStartBeforeEnd = (startDate: string, endDate: string) => {
    const parsedStartDate = startDate.split('/')
    const parsedEndDate = endDate.split('/')

    const StartDateDate = parseInt(parsedStartDate[1], 10)
    const StartDateMonth = parseInt(parsedStartDate[0], 10)
    const StartDateYear = parseInt(parsedStartDate[2], 10)

    const EndDateDate = parseInt(parsedEndDate[1], 10)
    const EndDateMonth = parseInt(parsedEndDate[0], 10)
    const EndDateYear = parseInt(parsedEndDate[2], 10)

    const startDateToSecs = getTime(new Date(StartDateYear, StartDateMonth - 1, StartDateDate, 0, 0, 0, 0))
    const endDateToSecs = getTime(new Date(EndDateYear, EndDateMonth - 1, EndDateDate, 23, 59, 59, 999))
    return endDateToSecs > startDateToSecs
  }
}
