import { Request, Response } from 'express'
import moment from 'moment'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import LicenceKind from '../../../enumeration/LicenceKind'
import logger from '../../../../logger'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/create/caseload'

    const [nomisRecord, deliusRecord] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.probationService.getProbationer(nomisId),
    ])

    if (nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to PP licence creation GET due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    return res.render('pages/create/confirmCreate', {
      licence: {
        crn: deliusRecord?.crn,
        licenceStartDate: nomisRecord.cvl.licenceStartDate,
        dateOfBirth: moment(nomisRecord.prisoner.dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(nomisRecord.prisoner.firstName),
        surname: convertToTitleCase(nomisRecord.prisoner.lastName),
        isEligibleForEarlyRelease: nomisRecord.cvl.isEligibleForEarlyRelease,
        kind: nomisRecord.cvl.licenceKind,
      },
      backLink,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals

    const nomisRecord = await this.licenceService.getPrisonerDetail(nomisId, user)
    if (nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to PP licence creation POST due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    const { licenceId } = await this.licenceService.createLicence({ nomsId: nomisId, type: LicenceKind.CRD }, user)
    return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
