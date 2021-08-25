import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class CheckAnswersRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const mockLicence = this.licenceService.getLicence()
    res.render('pages/create/checkAnswers', { licence: mockLicence })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params
    res.redirect(`/licence/create/id/${id}/confirmation`)
  }
}
