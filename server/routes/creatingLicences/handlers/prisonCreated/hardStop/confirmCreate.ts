import { Request, Response } from 'express'
import moment from 'moment'
import YesOrNo from '../../../../../enumeration/yesOrNo'
import LicenceService from '../../../../../services/licenceService'
import { convertToTitleCase } from '../../../../../utils/utils'
import logger from '../../../../../../logger'
import { NomisIdParams } from '../../../../types/routeParams'

export default class ConfirmCreateRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request<NomisIdParams>, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/view/cases'
    const {
      cvl: { licenceType, isEligibleForEarlyRelease, licenceStartDate, licenceKind },
      prisoner: { dateOfBirth, firstName, lastName },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    const probationCase = await this.licenceService.getProbationCase(nomisId, user)
    if (!probationCase.comAllocated) {
      logger.info(`no COM allocated for nomisId ${nomisId}`)
      return res.redirect(`/licence/hard-stop/create/nomisId/${nomisId}/no-com-allocated`)
    }

    return res.render('pages/create/prisonCreated/hardStop/confirmCreate', {
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

  POST = async (req: Request<NomisIdParams>, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer } = req.body
    const backLink = req.session.returnToCase || '/licence/view/cases'

    if (answer === YesOrNo.YES) {
      const { licenceId } = await this.licenceService.createPrisonLicence(nomisId, user)
      return res.redirect(`/licence/hard-stop/create/id/${licenceId}/initial-meeting-name`)
    }
    return res.redirect(backLink)
  }
}
