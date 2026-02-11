import { Request, Response } from 'express'
import moment from 'moment'
import YesOrNo from '../../../../../enumeration/yesOrNo'
import LicenceService from '../../../../../services/licenceService'
import { convertToTitleCase } from '../../../../../utils/utils'
import { ExternalTimeServedRecordRequest } from '../../../../../@types/licenceApiClientTypes'
import TimeServedService from '../../../../../services/timeServedService'
import ProbationService from '../../../../../services/probationService'
import logger from '../../../../../../logger'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly probationService: ProbationService,
    private readonly timeServedService: TimeServedService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/view/cases'
    const {
      cvl: { licenceType, isEligibleForEarlyRelease, licenceStartDate, licenceKind },
      prisoner: { dateOfBirth, firstName, lastName, bookingId },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    try {
      await this.probationService.getProbationer(nomisId)
    } catch (e) {
      logger.info(`Probation record not found for nomisId ${nomisId}: ${e.message}`)
      return res.redirect(`/licence/time-served/create/nomisId/${nomisId}/ndelius-missing-error`)
    }

    const existingTimeServedExternalRecord = await this.timeServedService.getTimeServedExternalRecord(
      nomisId,
      parseInt(bookingId, 10),
      user,
    )

    return res.render('pages/create/prisonCreated/timeServed/confirmCreate', {
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
      existingTimeServedExternalRecord,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const { answer, reasonForUsingNomis } = req.body
    const backLink = req.session.returnToCase || '/licence/view/cases'

    const {
      prisoner: { bookingId, prisonId },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    if (answer === YesOrNo.YES) {
      const createLicenceResponse = await this.licenceService.createPrisonLicence(nomisId, user)
      if (createLicenceResponse == null) {
        return res.redirect(`/licence/time-served/create/nomisId/${nomisId}/ndelius-missing-error`)
      }
      return res.redirect(`/licence/time-served/create/id/${createLicenceResponse.licenceId}/initial-meeting-name`)
    }

    if (answer === YesOrNo.NO) {
      await this.timeServedService.updateTimeServedExternalRecord(
        nomisId,
        parseInt(bookingId, 10),
        {
          reason: reasonForUsingNomis,
          prisonCode: prisonId,
        } as ExternalTimeServedRecordRequest,
        user,
      )
      req.flash('hasSelectedNomisForTimeServedLicenceCreation', 'true')
    }
    return res.redirect(backLink)
  }
}
