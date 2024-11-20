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
      cvl: { licenceType, isEligibleForEarlyRelease },
      prisoner: { confirmedReleaseDate, conditionalReleaseDate, dateOfBirth, firstName, lastName },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    return res.render('pages/create/hardStop/confirmCreate', {
      licence: {
        nomsId: nomisId,
        actualReleaseDate: confirmedReleaseDate ? moment(confirmedReleaseDate).format('DD/MM/YYYY') : undefined,
        conditionalReleaseDate: moment(conditionalReleaseDate).format('DD/MM/YYYY'),
        dateOfBirth: moment(dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(firstName),
        surname: convertToTitleCase(lastName),
        licenceType,
        isEligibleForEarlyRelease,
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
      const { licenceId } = await this.licenceService.createLicence(
        { nomsId: nomisId, type: LicenceKind.HARD_STOP },
        user,
      )
      return res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-name`)
    }
    return res.redirect(backLink)
  }
}
