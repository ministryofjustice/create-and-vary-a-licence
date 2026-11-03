import { Request, Response } from 'express'
import { format } from 'date-fns'

import LicenceService from '../../../services/licenceService'
import { getCsvResponse, mapReleasesWithMonitoring } from '../utils/recentOrUpcomingReleaseMonitoringUtils'

export default class UpcomingReleasesWithMonitoringConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const upcomingCases = mapReleasesWithMonitoring(await this.licenceService.getUpcomingReleasesWithMonitoring())

    return res.render('pages/reports/recentOrUpcomingReleasesWithMonitoring', {
      user,
      upcomingCases,
      releaseType: 'Upcoming',
      downloadCsvUrl: '/reports/upcoming-releases-with-monitoring/download-csv',
    })
  }

  GET_CSV = async (req: Request, res: Response): Promise<void> => {
    const upcomingCases = mapReleasesWithMonitoring(await this.licenceService.getUpcomingReleasesWithMonitoring())
    const { header, csv } = getCsvResponse(upcomingCases)

    res.type('text/csv')
    res.setHeader(
      `Content-disposition`,
      `attachment; filename=upcoming-releases-with-monitoring-conditions-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )
    res.send(`${header.join(',')}\n${csv}`)
  }
}
