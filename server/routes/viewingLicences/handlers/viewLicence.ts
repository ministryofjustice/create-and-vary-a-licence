import type { Request, Response } from 'express'
import { format } from 'date-fns'
import { plainToInstance } from 'class-transformer'
import { validate, ValidationError } from 'class-validator'
import LicenceStatus from '../../../enumeration/licenceStatus'
import type LicenceService from '../../../services/licenceService'
import { groupingBy, isHdcLicence, isInHardStopPeriod, parseCvlDateTime } from '../../../utils/utils'
import { AdditionalCondition, Licence } from '../../../@types/licenceApiClientTypes'
import { FieldValidationError } from '../../../middleware/validationMiddleware'
import HardStopLicenceToSubmit from '../../creatingLicences/types/hardStopLicenceToSubmit'
import HdcService from '../../../services/hdcService'
import { LicenceKind } from '../../../enumeration'

export default class ViewAndPrintLicenceRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly hdcService: HdcService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    let warningMessage

    if (req.query?.latestVersion) {
      const latestLicenceVersion = req.query?.latestVersion as string
      const latestLicence = await this.licenceService.getLicence(parseInt(latestLicenceVersion, 10), user)
      const statusMessage = latestLicence.statusCode === LicenceStatus.IN_PROGRESS ? 'started' : 'submitted'
      const date = this.getFormattedLicenceDate(latestLicence)
      warningMessage = "This is the last approved version of this person's licence.<br />"
      if (date) {
        warningMessage += `Another version was ${statusMessage} on ${date}.<br />`
      }
      warningMessage += 'You can print the most recent version once it has been approved.'
    }

    if (req.query?.lastApprovedVersion) {
      const lastApprovedLicenceVersion = req.query?.lastApprovedVersion as string
      const lastApprovedLicence = await this.licenceService.getLicence(parseInt(lastApprovedLicenceVersion, 10), user)
      const date = this.getFormattedLicenceDate(licence)
      warningMessage = 'This is the most recent version of this licence'
      if (date) {
        warningMessage += ` that was submitted on ${date}.<br />`
      } else {
        warningMessage += '.<br />'
      }
      warningMessage +=
        'Once this version is approved, you can print it.<br />' +
        `<a href="/licence/view/id/${lastApprovedLicence.id}/pdf-print" target="_blank">You can also view and print the last approved version of this licence</a>.`
    }

    if (
      licence?.statusCode === LicenceStatus.APPROVED ||
      licence?.statusCode === LicenceStatus.ACTIVE ||
      licence?.statusCode === LicenceStatus.SUBMITTED ||
      licence?.statusCode === LicenceStatus.REJECTED ||
      licence?.statusCode === LicenceStatus.IN_PROGRESS
    ) {
      if (licence?.comStaffId !== user?.deliusStaffIdentifier) {
        // Recorded here as we do not know the reason for fetchLicence in the API
        await this.licenceService.recordAuditEvent(
          `Licence viewed for ${licence.forename} ${licence.surname}`,
          `ID ${licence.id} type ${licence.typeCode} status ${licence.statusCode} version ${licence.version}`,
          licence.id,
          new Date(),
          user,
        )
      }

      const hdcLicenceData = isHdcLicence(licence) ? await this.hdcService.getHdcLicenceData(licence.id) : null

      res.render('pages/view/view', {
        additionalConditions: groupingBy(licence.additionalLicenceConditions as AdditionalCondition[], 'code'),
        warningMessage,
        isEditableByPrison: licence.statusCode !== LicenceStatus.ACTIVE && isInHardStopPeriod(licence),
        isPrisonUser: user.authSource === 'nomis',
        initialApptUpdatedMessage: req.flash('initialApptUpdated')?.[0],
        hdcLicenceData,
      })
    } else {
      res.redirect(`/licence/view/cases`)
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user, licence } = res.locals

    const errors = await this.validateLicence(licence)
    if (errors.length > 0) {
      req.flash('validationErrors', JSON.stringify(errors))
      const referer = req.get('Referer') || `/licence/view/id/${licenceId}/show`
      return res.redirect(referer)
    }

    await this.licenceService.submitLicence(licenceId, user)

    if (licence.kind === LicenceKind.TIME_SERVED) {
      return res.redirect(`/licence/time-served/create/id/${licenceId}/contact-probation-team`)
    }
    return res.redirect(`/licence/hard-stop/id/${licenceId}/confirmation`)
  }

  getFormattedLicenceDate(licence: Licence): string {
    let licenceDate
    switch (licence.statusCode) {
      case LicenceStatus.IN_PROGRESS:
        licenceDate = licence.dateCreated
        break
      case LicenceStatus.APPROVED:
        licenceDate = licence.approvedDate
        break
      case LicenceStatus.SUBMITTED:
        licenceDate = licence.submittedDate
        break
      default:
        licenceDate = licence.dateLastUpdated
        break
    }
    return licenceDate ? format(parseCvlDateTime(licenceDate, { withSeconds: true }), 'd LLLL yyyy') : null
  }

  private validateLicence = async (licence: Licence): Promise<FieldValidationError[]> => {
    const licenceToSubmit = plainToInstance(HardStopLicenceToSubmit, licence, { excludeExtraneousValues: true })
    const errors: ValidationError[] = await validate(licenceToSubmit)

    return errors.flatMap(error => ({
      field: error.property,
      message: Object.values(error.constraints)[Object.values(error.constraints).length - 1],
    }))
  }
}
