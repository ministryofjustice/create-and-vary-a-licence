import { Request, Response } from 'express'
import type LicenceApiClient from '../../../data/licenceApiClient'

export default class PromptCasesRoutes {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const coms = await this.licenceApiClient.getComsToPrompt()

    const header = ['ComName', 'Email', 'Casename', 'Crn', 'Release Date']
    const csv = coms
      // @ts-expect-error: not sure how this works as I can't see an subjects field on PromptComNotification
      .flatMap(com => com.subjects.map(s => [com.comName, com.email, s.name, s.crn, s.releaseDate]))
      .map(row => row.join(','))
      .join('\n')

    res.type('text/csv')
    res.send(`${header.join(',')}\n${csv}`)
  }
}
