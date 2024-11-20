import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import YesOrNo from '../../../enumeration/yesOrNo'
import { isInHardStopPeriod, licenceIsTwoDaysToRelease } from '../../../utils/utils'

export default class EditQuestionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { licenceId } = req.params
    if (
      isInHardStopPeriod(licence) ||
      ![LicenceStatus.APPROVED, LicenceStatus.SUBMITTED, LicenceStatus.REJECTED].includes(
        licence.statusCode as LicenceStatus,
      )
    ) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }
    res.locals.closeToRelease =
      [LicenceStatus.APPROVED, LicenceStatus.SUBMITTED].includes(licence.statusCode as LicenceStatus) &&
      licenceIsTwoDaysToRelease(res.locals.licence)
    return res.render('pages/create/editQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    const { answer } = req.body
    const { statusCode } = res.locals.licence

    let licenceIdToEdit = licenceId
    if (answer === YesOrNo.YES) {
      if (LicenceStatus.APPROVED === statusCode) {
        const newLicenceVersion = await this.licenceService.editApprovedLicence(licenceId, user)
        licenceIdToEdit = newLicenceVersion.licenceId.toString()
      } else {
        await this.licenceService.updateStatus(parseInt(licenceId, 10), LicenceStatus.IN_PROGRESS, user)
      }
    }
    return res.redirect(`/licence/create/id/${licenceIdToEdit}/check-your-answers`)
  }
}
