import { Request, Response } from 'express'
import moment from 'moment'
import YesOrNo from '../../../../enumeration/yesOrNo'
import LicenceService from '../../../../services/licenceService'
import LicenceKind from '../../../../enumeration/LicenceKind'
import { convertToTitleCase } from '../../../../utils/utils'
import RecordNomisTimeServedLicenceReasonService from '../../../../services/recordNomisTimeServedLicenceReasonService'
import {
  RecordNomisLicenceReasonRequest,
  UpdateNomisLicenceReasonRequest,
} from '../../../../@types/licenceApiClientTypes'

export default class ConfirmCreateRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly recordNomisTimeServedLicenceReasonService: RecordNomisTimeServedLicenceReasonService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { nomisId } = req.params
    const { user } = res.locals
    const backLink = req.session?.returnToCase || '/licence/view/cases'
    const {
      cvl: { licenceType, isEligibleForEarlyRelease, licenceStartDate, licenceKind },
      prisoner: { dateOfBirth, firstName, lastName, bookingId },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    const existingNomisLicenceCreationReason =
      await this.recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason(
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
      existingNomisLicenceCreationReason,
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
      const hasExistingNomisLicenceCreationReason =
        (await this.recordNomisTimeServedLicenceReasonService.getExistingNomisLicenceCreationReason(
          nomisId,
          parseInt(bookingId, 10),
          user,
        )) !== null

      if (hasExistingNomisLicenceCreationReason) {
        await this.recordNomisTimeServedLicenceReasonService.updateNomisLicenceCreationReason(
          nomisId,
          parseInt(bookingId, 10),
          {
            reason: reasonForUsingNomis,
          } as UpdateNomisLicenceReasonRequest,
          user,
        )
        return res.redirect(backLink)
      }
      await this.recordNomisTimeServedLicenceReasonService.recordNomisLicenceCreationReason(
        {
          nomsId: nomisId,
          bookingId: parseInt(bookingId, 10),
          reason: reasonForUsingNomis,
          prisonCode: prisonId,
        } as RecordNomisLicenceReasonRequest,
        user,
      )
    }
    return res.redirect(backLink)
  }
}
