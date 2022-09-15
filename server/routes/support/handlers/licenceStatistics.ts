import { Request, Response } from 'express'
import { Parser } from 'json2csv'
import LicenceService from '../../../services/licenceService'
import convertToDateString from '../../../utils/date'

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
        label: 'Prison',
        value: 'prison',
      },
      {
        label: 'Licence type',
        value: 'licenceType',
      },
      {
        label: 'Eligible for CVL',
        value: 'eligibleForCvl',
      },
      {
        label: 'In progress',
        value: 'inProgress',
      },
      {
        label: 'Submitted',
        value: 'submitted',
      },
      {
        label: 'Approved',
        value: 'approved',
      },
      {
        label: 'Active',
        value: 'active',
      },
      {
        label: 'Inactive total',
        value: 'inactiveTotal',
      },
      {
        label: 'Inactive not approved',
        value: 'inactiveNotApproved',
      },
      {
        label: 'Inactive approved',
        value: 'inactiveApproved',
      },
      {
        label: 'Inactive HDC approved',
        value: 'inactiveHdcApproved',
      },
      {
        label: 'Approved not printed',
        value: 'approvedNotPrinted',
      },
    ]
    const json2csvParser = new Parser({ fields })

    const licenceStatistics = await this.licenceService.getlicenceStatistics(
      convertToDateString(startDate),
      convertToDateString(endDate),
      user
    )
    const csv = json2csvParser.parse(licenceStatistics)

    res.setHeader('content-type', 'text/csv')
    return res.send(csv)
  }
}
