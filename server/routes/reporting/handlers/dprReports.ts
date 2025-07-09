import { NextFunction, Request, Response } from 'express'
import ReportListUtils from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/components/report-list/utils'
import DprService from '../../../services/dprService'
import config from '../../../config'

export default class DprReportsRoutes {
  constructor(private readonly dprService: DprService) {}

  GET = (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params
    const dprReports = res.locals.reportDefinitions

    // Can have multiple reports on the same dataset but currently have one rpoert per dataset
    // if it were multiple then would need to create a report list to house some metadata to allow us to pick the right variant
    const reportDefinition = dprReports.find(report => report.id === id)
    const variant = reportDefinition.variants.find(variant => variant.id === id)

    ReportListUtils.createReportListRequestHandler({
      title: 'CVL Reports',
      definitionName: reportDefinition.id,
      variantName: variant.id,
      apiUrl: config.apis.licenceApi.url,
      apiTimeout: config.apis.licenceApi.timeout.deadline,
      layoutTemplate: 'partials/dprReport.njk',
      tokenProvider: (req, res) => res.locals.user?.token,
    })(req, res, next)
  }
}
