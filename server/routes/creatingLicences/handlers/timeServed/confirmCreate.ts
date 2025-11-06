import { Request, Response } from 'express'
import moment from 'moment'
import YesOrNo from '../../../../enumeration/yesOrNo'
import LicenceService from '../../../../services/licenceService'
import LicenceKind from '../../../../enumeration/LicenceKind'
import { convertToTitleCase } from '../../../../utils/utils'
import RecordNomisTimeServedLicenceReasonService from '../../../../services/recordNomisTimeServedLicenceReasonService'
import { RecordNomisLicenceReasonRequest } from '../../../../@types/licenceApiClientTypes'

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
      prisoner: { dateOfBirth, firstName, lastName, bookingId, prisonId },
    } = await this.licenceService.getPrisonerDetail(nomisId, user)

    req.flash('bookingId', bookingId)
    req.flash('prisonId', prisonId)

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
    const { answer, reasonForUsingNomis } = req.body
    const backLink = req.session.returnToCase || '/licence/view/cases'
    const bookingId = req.flash('bookingId')[0]
    const prisonId = req.flash('prisonId')[0]
    const existingReasonForCreatingLicenceInNomis =
      await this.recordNomisTimeServedLicenceReasonService.getNomisLicenceCreationReason(
        nomisId,
        parseInt(bookingId, 10),
        user,
      )

    console.log('existingReasonForCreatingLicenceInNomis', existingReasonForCreatingLicenceInNomis)

    if (answer === YesOrNo.YES) {
      if (existingReasonForCreatingLicenceInNomis !== null) {
        console.log('There is an existing reason, so deleting it')
        await this.recordNomisTimeServedLicenceReasonService.deleteNomisLicenceCreationReason(
          nomisId,
          parseInt(bookingId, 10),
          user,
        )
      }
      console.log('Lets create the licence in CVL')
      await this.licenceService.createLicence({ nomsId: nomisId, type: LicenceKind.HARD_STOP }, user)
      return res.redirect(`/licence/view/cases`)
    }

    if (answer === YesOrNo.NO) {
      if (existingReasonForCreatingLicenceInNomis !== null) {
        console.log('There is an existing reason, so updating it')
        await this.recordNomisTimeServedLicenceReasonService.updateNomisLicenceCreationReason(
          {
            reason: reasonForUsingNomis,
          } as RecordNomisLicenceReasonRequest,
          nomisId,
          parseInt(bookingId, 10),
          user,
        )
        return res.redirect(backLink)
      }
      console.log('Lets record a reason for the licence in NOMIS')
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
    req.flash('answer', answer)
    return res.redirect(backLink)
  }
}
