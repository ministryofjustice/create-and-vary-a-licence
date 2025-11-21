import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import UserType from '../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../enumeration/pathType'

export default class InitialMeetingContactRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly path: PathType,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { edit } = req.query
    return res.render('pages/initialAppointment/prisonCreated/initialMeetingContact', {
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
      edit,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateContactNumber(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, UserType.PRISON)
    if (this.path === PathType.EDIT) {
      res.redirect(`/licence/hard-stop/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-time`)
    }
  }
}
