import { Request, Response } from 'express'
import moment from 'moment'
import YesOrNo from '../../../../enumeration/yesOrNo'
import LicenceService from '../../../../services/licenceService'
import LicenceKind from '../../../../enumeration/LicenceKind'
import { convertToTitleCase } from '../../../../utils/utils'

export default class ConfirmCreateRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/view/cases'
    const {
      cvl: { licenceType, isEligibleForEarlyRelease, licenceStartDate, licenceKind },
      prisoner: { dateOfBirth, firstName, lastName },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    return res.render('pages/create/timeServed/confirmCreate', {
      licence: {
        nomsId: nomisId,
        licenceStartDate,
        dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(firstName),
        surname: convertToTitleCase(lastName),
        licenceType,
        isEligibleForEarlyRelease,
        kind: licenceKind,
      },
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer } = req.body
    const backLink = req.session.returnToCase || '/licence/view/cases'

    if (answer === YesOrNo.YES) {
      await this.licenceService.createLicence({ nomsId: nomisId, type: LicenceKind.HARD_STOP }, user)
      return res.redirect(`/licence/view/cases`)
    }
    return res.redirect(backLink)
  }
}
