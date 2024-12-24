import { Request, Response } from 'express'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import LicenceService from '../../../services/licenceService'
import { convertToTitleCase } from '../../../utils/utils'

export default class OffenderLicenceTypeRoutes {
  constructor(
    private licenceService: LicenceService,
    private licenceOverrideService: LicenceOverrideService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId } = req.params
    const licence = await this.licenceService.getLicence(parseInt(licenceId, 10), user)
    res.render('pages/support/offenderLicenceType', {
      licence,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, nomsId } = req.params
    const { licenceType, reason } = req.body

    const errors = await this.licenceOverrideService.overrideType(
      parseInt(licenceId, 10),
      {
        licenceType,
        reason,
      },
      user,
    )
    if (errors) {
      const fieldErrors = Object.entries(errors).map(([field, message]) => ({
        field: '',
        message: `${field} ${convertToTitleCase(message).replaceAll('_', ' ')}`,
      }))
      req.flash('validationErrors', JSON.stringify(fieldErrors))
      req.flash('formResponses', JSON.stringify(req.body))
      return res.redirect(`/support/offender/${nomsId}/licence/${licenceId}/type`)
    }

    return res.redirect(`/support/offender/${nomsId}/licences`)
  }
}
