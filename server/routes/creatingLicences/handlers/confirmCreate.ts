import { Request, Response } from 'express'
import moment from 'moment'
import ProbationService from '../../../services/probationService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'
import HdcService from '../../../services/hdc/hdcService'
import logger from '../../../../logger'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly probationService: ProbationService,
    private readonly licenceService: LicenceService,
    private readonly hdcService: HdcService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/create/caseload'

    const [nomisRecord, deliusRecord] = await Promise.all([
      this.licenceService.getPrisonerDetail(nomisId, user),
      this.licenceService.getProbationCase(nomisId, user),
    ])

    if (nomisRecord.cvl.isInHardStopPeriod) {
      logger.error('Access denied to PP licence creation GET due to being in hard stop period')
      return res.redirect('/access-denied')
    }

    const hdcRiskChecksCompleted = await this.hdcService.hasHdcRiskChecksCompleted(
      nomisRecord.prisoner.bookingId,
      nomisRecord.cvl.eligibleKind,
    )

    return res.render('pages/create/confirmCreate', {
      licence: {
        crn: deliusRecord?.crn,
        licenceStartDate: nomisRecord.cvl.licenceStartDate,
        dateOfBirth: moment(nomisRecord.prisoner.dateOfBirth).format('DD/MM/YYYY'),
        forename: convertToTitleCase(nomisRecord.prisoner.firstName),
        surname: convertToTitleCase(nomisRecord.prisoner.lastName),
        isEligibleForEarlyRelease: nomisRecord.cvl.isEligibleForEarlyRelease,
        eligibleKind: nomisRecord.cvl.eligibleKind,
        homeDetentionCurfewActualDate: nomisRecord.prisoner.homeDetentionCurfewActualDate
          ? moment(nomisRecord.prisoner.homeDetentionCurfewActualDate).format('DD/MM/YYYY')
          : null,
        homeDetentionCurfewEligibilityDate: nomisRecord.prisoner.homeDetentionCurfewEligibilityDate
          ? moment(nomisRecord.prisoner.homeDetentionCurfewEligibilityDate).format('DD/MM/YYYY')
          : null,
      },
      backLink,
      hdcRiskChecksCompleted,
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

    const { licenceId } = await this.licenceService.createProbationLicence(nomisId, user)
    return res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
