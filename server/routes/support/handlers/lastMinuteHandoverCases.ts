import { Request, Response } from 'express'
import { format } from 'date-fns'

import LicenceService from '../../../services/licenceService'
import { convertToTitleCase, escapeCsv } from '../../../utils/utils'

export default class LastMinuteHandoverCasesRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const lastMinuteCases = await this.getLastMinuteCases()

    return res.render('pages/support/lastMinuteHandoverCases', { user, lastMinuteCases })
  }

  GET_CSV = async (req: Request, res: Response): Promise<void> => {
    const lastMinuteCases = await this.getLastMinuteCases()

    const header = [
      'Probation Region',
      'Prison Name',
      'Release Date',
      'Licence Status',
      'Probation Practitioner',
      'Prison Number',
      'CRN',
      'Prisoner Name',
    ]

    const csv = lastMinuteCases
      .map(lastMinuteCases => [
        lastMinuteCases.probationRegion,
        lastMinuteCases.prisonName,
        lastMinuteCases.releaseDate,
        lastMinuteCases.status,
        lastMinuteCases.probationPractitioner,
        lastMinuteCases.prisonerNumber,
        lastMinuteCases.crn,
        lastMinuteCases.prisonerName,
      ])
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.setHeader(
      `Content-disposition`,
      `attachment; filename=upcoming-releases-with-incomplete-licences-report-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
    )
    res.send(`${header.join(',')}\n${csv}`)
  }

  private async getLastMinuteCases() {
    const lastMinuteCases = await this.licenceService.getLastMinuteCases()

    return lastMinuteCases.map(lastMinuteCase => {
      return {
        crn: lastMinuteCase.crn,
        prisonerNumber: lastMinuteCase.prisonerNumber,
        prisonCode: lastMinuteCase.prisonCode,
        prisonName: escapeCsv(lastMinuteCase.prisonName),
        releaseDate: lastMinuteCase.releaseDate,
        probationPractitioner: lastMinuteCase.probationPractitioner,
        prisonerName: convertToTitleCase(escapeCsv(lastMinuteCase.prisonerName)),
        probationRegion: escapeCsv(lastMinuteCase.probationRegion),
        status: lastMinuteCase.status,
      }
    })
  }
}
