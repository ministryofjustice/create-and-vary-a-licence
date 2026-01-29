import { Request, Response } from 'express'
import { format } from 'date-fns'

import LicenceService from '../../../services/licenceService'

export default class UpcomingReleasesWithMonitoringConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const upcomingCases = await this.getUpcomingReleasesWithMonitoring()

    return res.render('pages/reports/upcomingReleasesWithMonitoring', {
      user,
      upcomingCases,
    })
  }

  GET_CSV = async (req: Request, res: Response): Promise<void> => {
    const upcomingCases = await this.getUpcomingReleasesWithMonitoring()

    const header = ['Prison Number', 'Name', 'CRN', 'Licence Status', 'Ems conditions', 'Licence Start Date']

    const csv = upcomingCases
      .map(upcomingCases => [
        upcomingCases.prisonNumber,
        upcomingCases.fullName,
        upcomingCases.crn,
        upcomingCases.status,
        upcomingCases.emConditionCodes,
        upcomingCases.licenceStartDate,
      ])
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.setHeader(
      `Content-disposition`,
      `attachment; filename=upcoming-releases-with-monitoring-conditions-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )
    res.send(`${header.join(',')}\n${csv}`)
  }

  private async getUpcomingReleasesWithMonitoring() {
    const upcomingCases = await this.licenceService.getUpcomingReleasesWithMonitoring()

    return upcomingCases.map(upcomingCase => {
      return {
        crn: upcomingCase.crn,
        prisonNumber: upcomingCase.prisonNumber,
        status: upcomingCase.status,
        licenceStartDate: upcomingCase.licenceStartDate,
        emConditionCodes: upcomingCase.emConditionCodes,
        fullName: upcomingCase.fullName,
      }
    })
  }
}
