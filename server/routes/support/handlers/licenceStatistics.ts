import { Request, Response } from 'express'
import { Parser } from 'json2csv'
import LicenceService from '../../../services/licenceService'

export default class LicenceStatisticsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    return res.render('pages/support/licenceStatistics')
  }

  POST = async (req: Request, res: Response) => {
    const { user } = res.locals
    const { startDate, endDate } = req.body
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
}
