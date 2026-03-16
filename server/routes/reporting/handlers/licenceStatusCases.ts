import { Request, Response } from 'express'
import { format } from 'date-fns'

import LicenceService from '../../../services/licenceService'
import { convertToTitleCase, escapeCsv } from '../../../utils/utils'

export default class LicenceStatusCasesRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const cases = await this.getLicenceStatusCases()

    return res.render('pages/reports/licenceStatusCases', {
      user,
      cases,
    })
  }

  GET_CSV = async (req: Request, res: Response): Promise<void> => {
    const cases = await this.getLicenceStatusCases()

    const header = ['Probation Region', 'Prison', 'CRN', 'Nomis Number', 'Prisoner Name', 'Licence Status']

    const csv = cases
      .map(caseItem => [
        caseItem.probationRegion,
        caseItem.prison,
        caseItem.crn,
        caseItem.nomisNumber,
        caseItem.prisonerName,
        caseItem.status,
      ])
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.setHeader(
      `Content-disposition`,
      `attachment; filename=licences-status-cases-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )
    res.send(`${header.join(',')}\n${csv}`)
  }

  private async getLicenceStatusCases() {
    const cases = await this.licenceService.getLicenceStatusCases()

    return cases.map(caseItem => {
      return {
        probationRegion: escapeCsv(caseItem.probationRegion),
        prison: escapeCsv(caseItem.prison),
        crn: caseItem.crn,
        nomisNumber: caseItem.nomisNumber,
        prisonerName: convertToTitleCase(escapeCsv(caseItem.prisonerName)),
        status: caseItem.status,
      }
    })
  }
}
