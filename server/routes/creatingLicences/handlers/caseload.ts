import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const caseload = [
      {
        name: 'Adam Balasaravika',
        crnNumber: 'X381306',
        conditionalReleaseDate: '03 August 2022',
      },
    ]
    res.render('pages/create/caseload', { caseload })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    const { licenceId } = await this.licenceService.createLicence(username)
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
