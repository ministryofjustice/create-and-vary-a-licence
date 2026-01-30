import { NextFunction, Request, Response } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import DprService from '../../../services/dprService'
import config from '../../../config'
import { getSystemToken } from '../../../data/systemToken'

export default class DprReportsRoutes {
  constructor(private readonly dprService: DprService) {}

  GET = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const { user } = res.locals

    const { token } = await getSystemToken(req.user.username)

    const dprReports = await this.dprService.getDefinitions({ token, username: user.username })
    const reportDefinition = dprReports.find(report => report.id === id)
    const variant = reportDefinition.variants.find(variant => variant.id === id)

    return ReportListUtils.createReportListRequestHandler({
      title: 'CVL Reports',
      definitionName: reportDefinition.id,
      variantName: variant.id,
      apiUrl: config.apis.licenceApi.url,
      apiTimeout: config.apis.licenceApi.timeout.deadline,
      layoutTemplate: 'partials/dprReport.njk',
      tokenProvider: () => token,
    })(req, res, next)
  }
}
