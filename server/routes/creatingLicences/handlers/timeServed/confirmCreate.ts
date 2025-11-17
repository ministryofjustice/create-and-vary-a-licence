import { Request, Response } from 'express'
import moment from 'moment'
import YesOrNo from '../../../../enumeration/yesOrNo'
import LicenceService from '../../../../services/licenceService'
import LicenceKind from '../../../../enumeration/LicenceKind'
import { convertToTitleCase } from '../../../../utils/utils'
import { ExternalTimeServedRecordRequest } from '../../../../@types/licenceApiClientTypes'
import TimeServedService from '../../../../services/timeServedService'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly timeServedExternalRecordService: TimeServedService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/view/cases'
    const {
      cvl: { licenceType, isEligibleForEarlyRelease, licenceStartDate, licenceKind },
      prisoner: { dateOfBirth, firstName, lastName, bookingId },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    const existingTimeServedExternalRecord = await this.timeServedExternalRecordService.getTimeServedExternalRecord(
      nomisId,
      parseInt(bookingId, 10),
      user,
    )

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
      await this.licenceService.createLicence({ nomsId: nomisId, type: LicenceKind.HARD_STOP }, user)
      return res.redirect(`/licence/view/cases`)
    }

    if (answer === YesOrNo.NO) {
      await this.timeServedExternalRecordService.updateTimeServedExternalRecord(
        nomisId,
        parseInt(bookingId, 10),
        {
          reason: reasonForUsingNomis,
          prisonCode: prisonId,
        } as ExternalTimeServedRecordRequest,
        user,
      )
    }
    return res.redirect(backLink)
  }
}
