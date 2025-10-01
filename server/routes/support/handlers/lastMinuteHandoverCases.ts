import { Request, Response } from 'express'
import { format } from 'date-fns'

import LicenceService from '../../../services/licenceService'
import { escapeCsv } from '../../../utils/utils'

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
      'CRN',
      'Prison Number',
      'Release Date',
      'Prison Code',
      'Probation Practitioner',
      'Probation Region',
      'Prisoner Name',
      'Licence Status',
    ]

    const csv = lastMinuteCases
      .map(lastMinuteCases => [
        lastMinuteCases.crn,
        lastMinuteCases.prisonerNumber,
        lastMinuteCases.releaseDate,
        lastMinuteCases.prisonCode,
        lastMinuteCases.probationPractitioner,
        lastMinuteCases.probationRegion,
        lastMinuteCases.prisonerName,
        lastMinuteCases.status,
      ])
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.setHeader(
      `Content-disposition`,
      `attachment; filename=tag-report-cases-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`,
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
        releaseDate: lastMinuteCase.releaseDate,
        probationPractitioner: lastMinuteCase.probationPractitioner,
        prisonerName: escapeCsv(lastMinuteCase.prisonerName),
        probationRegion: escapeCsv(lastMinuteCase.probationRegion),
        status: lastMinuteCase.status,
      }
    })
  }
}
