import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import PrisonRegisterService from '../../../services/prisonRegisterService'

import { User } from '../../../@types/CvlUserDetails'

export default class OmuEmailAddressRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly prisonRegisterService: PrisonRegisterService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    return res.render('pages/support/manageOmuEmailAddress', {
      prisonIdCurrent: req.flash('prisonIdCurrent')[0],
      emailCurrent: req.flash('emailCurrent')[0],
      prisonIdEdit: req.flash('prisonIdEdit')[0],
      email: req.flash('email')[0],
      requestStatus: req.flash('requestStatus')[0],
      prisonIdDelete: req.flash('prisonIdDelete')[0],
      deleteMessage: req.flash('deleteMessage')[0],
    })
  }

  CURRENT = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonIdCurrent } = req.body
    const prisonId = prisonIdCurrent.toUpperCase()
    let result
    let emailCurrent

    const prisonExists = await this.checkPrisonExists(prisonId, user)

    if (prisonExists) {
      result = await this.licenceService.getOmuEmail(prisonId, user)
      emailCurrent = result?.email || `Email for ${prisonId} does not exist`
    } else {
      emailCurrent = `Prison ID ${prisonId} does not exist`
    }

    req.flash('prisonIdCurrent', prisonId)
    req.flash('emailCurrent', emailCurrent)
    res.redirect('/support/manage-omu-email-address')
  }

  ADD_OR_EDIT = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonIdEdit, email } = req.body
    const prisonId = prisonIdEdit.toUpperCase()
    const prisonExists = await this.checkPrisonExists(prisonId, user)

    if (prisonExists) {
      await this.licenceService.updateOmuEmailAddress(prisonId, user, { email })
      req.flash('requestStatus', `Email for ${prisonId} added/edited`)
    } else {
      req.flash('requestStatus', `Prison ID ${prisonId} does not exist`)
    }
    req.flash('prisonIdEdit', prisonId)
    req.flash('email', email)
    res.redirect('/support/manage-omu-email-address')
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonIdDelete } = req.body
    const prisonId = prisonIdDelete.toUpperCase()
    let result

    const prisonExists = await this.checkPrisonExists(prisonId, user)

    if (prisonExists) {
      result = await this.licenceService.getOmuEmail(prisonId, user)
    } else {
      req.flash('deleteMessage', `Prison ID ${prisonId} does not exist`)
    }

    if (result) {
      await this.licenceService.deleteOmuEmailAddress(prisonId, user)
      req.flash('deleteMessage', `Email for ${prisonId} deleted`)
    } else {
      req.flash('deleteMessage', `Email for ${prisonId} does not exist`)
    }

    req.flash('prisonIdDelete', prisonId)
    res.redirect('/support/manage-omu-email-address')
  }

  checkPrisonExists = async (prisonId: string, user: User) => {
    const prison = await this.prisonRegisterService.getPrisonDescription(prisonId, user)
    return prison
  }
}
