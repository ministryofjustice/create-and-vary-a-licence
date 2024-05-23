import { Request, Response } from 'express'
import type PromptLicenceCreationService from '../../../../jobs/promptLicenceCreationService'

export default class PromptCasesRoutes {
  constructor(private readonly promptLicenceCreationService: PromptLicenceCreationService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const emailGroups = await this.promptLicenceCreationService.gatherGroups()

    const header = ['ComName', 'Email', 'Type', 'Casename', 'Crn', 'Release Date']
    const csv = emailGroups
      .flatMap(group => {
        const initialCases = group.initialPromptCases.map(c => [
          group.comName,
          group.email,
          'initial',
          c.name,
          c.crn,
          c.releaseDate,
        ])
        const urgentCases = group.urgentPromptCases.map(c => [
          group.comName,
          group.email,
          'urgent',
          c.name,
          c.crn,
          c.releaseDate,
        ])

        return [header, ...initialCases, ...urgentCases]
      })
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.send(csv)
  }
}
