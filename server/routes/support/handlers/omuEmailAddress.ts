import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class OmuEmailAddressRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { formResponses } = res.locals

    return res.render('pages/support/manageOmuEmailAddress', {
      formResponses,
      prisonIdCurrent: req.flash('prisonIdCurrent')[0],
      emailCurrent: req.flash('emailCurrent')[0],
      prisonIdDelete: req.flash('prisonIdDelete')[0],
      deleteMessage: req.flash('deleteMessage')[0],
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonIdCurrent } = req.body
    const result = await this.licenceService.getOmuEmail(prisonIdCurrent.toUpperCase(), user)
    const emailCurrent = result?.email || 'None found'

    req.flash('prisonIdCurrent', prisonIdCurrent)
    req.flash('emailCurrent', emailCurrent)
    res.redirect('/support/manage-omu-email-address')
  }

  ADD_OR_EDIT = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonIdEdit, email } = req.body

    await this.licenceService.updateOmuEmailAddress(prisonIdEdit.toUpperCase(), user, { email })
    res.redirect('/support/manage-omu-email-address')
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { prisonIdDelete } = req.body
    const result = await this.licenceService.getOmuEmail(prisonIdDelete.toUpperCase(), user)

    if (result?.email) {
      await this.licenceService.deleteOmuEmailAddress(prisonIdDelete.toUpperCase(), user)
      req.flash('deleteMessage', `Email for ${prisonIdDelete.toUpperCase()} deleted`)
    } else {
      req.flash('deleteMessage', `Email for ${prisonIdDelete.toUpperCase()} does not exist`)
    }

    req.flash('prisonIdDelete', prisonIdDelete)
    res.redirect('/support/manage-omu-email-address')
  }
}
