import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus, { selectableLicenceStatus } from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import { User } from '../../../@types/CvlUserDetails'
import LicenceOverrideService from '../../../services/licenceOverrideService'

export default class OffenderLicenceStatusRoutes {
  constructor(
    private licenceService: LicenceService,
    private licenceOverrideService: LicenceOverrideService
  ) {}

  private async getLicenceData(nomsId: string, licenceId: string, user: User) {
    const licences = await this.licenceService.getLicencesByNomisIdsAndStatus([nomsId], [], user)

    const currentLicence = licences.find(l => l.licenceId === parseInt(licenceId, 10))

    // multiple licences against an offender can be INACTIVE
    const availableCodes = selectableLicenceStatus
      .filter((s: LicenceStatus) => s === LicenceStatus.INACTIVE || !licences.some(l => l.licenceStatus === s))
      .sort()

    return {
      currentLicence,
      statusCodes: availableCodes,
    }
  }

  /**
   * Retrieve all licences assigned to the current offender.
   * Exclude all status codes currently in use, other than the current status code for the selected
   * licence, or any with the INACTIVE status. INACTIVE can be assigned to multiple licences.
   */
  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, nomsId } = req.params

    // multiple licences against an offender can be INACTIVE
    const data = await this.getLicenceData(nomsId, licenceId, user)

    res.render('pages/support/offenderLicenceStatus', {
      currentStatus: data.currentLicence.licenceStatus,
      availableStatusCodes: data.statusCodes,
      licenceId,
      statusConfig,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId, nomsId } = req.params
    const { user } = res.locals
    const { status, statusChangeReason } = req.body

    if (status && statusChangeReason) {
      await this.licenceOverrideService.overrideStatusCode(parseInt(licenceId, 10), status, statusChangeReason, user)
      res.redirect(`/support/offender/${nomsId}/licences`)
      return
    }

    const data = await this.getLicenceData(nomsId, licenceId, user)

    res.render('pages/support/offenderLicenceStatus', {
      currentStatus: data.currentLicence.licenceStatus,
      availableStatusCodes: data.statusCodes,
      licenceId,
      statusConfig,
      status,
      statusChangeReason,
      statusCodeError: !status,
      statusReasonError: !statusChangeReason,
    })
  }
}
