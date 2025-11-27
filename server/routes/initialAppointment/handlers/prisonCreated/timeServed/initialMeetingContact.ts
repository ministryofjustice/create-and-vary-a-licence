import { Request, Response } from 'express'
import LicenceService from '../../../../../services/licenceService'
import UserType from '../../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../../enumeration/pathType'
import { getTimeServedEditPath } from './index'

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
      return res.redirect(getTimeServedEditPath(this.path, licence))
    }
    return res.redirect(`/licence/time-served/create/id/${licenceId}/initial-meeting-time`)
  }
}
