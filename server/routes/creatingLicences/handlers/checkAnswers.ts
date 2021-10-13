import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'

export default class CheckAnswersRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const mockLicence = this.licenceService.getLicenceStub()
    res.render('pages/create/checkAnswers', { licence: mockLicence })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { username } = req.user
    await this.licenceService.updateStatus(licenceId, LicenceStatus.SUBMITTED, username)
    res.redirect(`/licence/create/id/${licenceId}/confirmation`)
  }
}
