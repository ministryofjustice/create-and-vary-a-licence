import { Request, Response } from 'express'
import { stringToAddressObject } from '../../../../utils/utils'
import LicenceService from '../../../../services/licenceService'
import UserType from '../../../../enumeration/userType'
import flashInitialApptUpdatedMessage from '../initialMeetingUpdatedFlashMessage'
import PathType from '../../../../enumeration/pathType'

export default class InitialMeetingPlaceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly userType: UserType,
    private readonly path: PathType
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals

    const formAddress = stringToAddressObject(licence.appointmentAddress)
    return res.render('pages/create/hardStop/initialMeetingPlace', {
      formAddress,
      continueOrSaveLabel: this.path === PathType.EDIT ? 'Save' : 'Continue',
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals
    await this.licenceService.updateAppointmentAddress(licenceId, req.body, user)

    flashInitialApptUpdatedMessage(req, licence, this.userType)
    if (this.path === PathType.EDIT) {
      res.redirect(`/licence/hard-stop/id/${licenceId}/check-your-answers`)
    } else {
      res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-contact`)
    }
  }
}
