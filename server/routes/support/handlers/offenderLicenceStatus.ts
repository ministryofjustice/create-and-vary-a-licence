import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import { User } from '../../../@types/CvlUserDetails'

export default class OffenderLicenceStatusRoutes {
  constructor(private licenceService: LicenceService) {}

  private async getLicenceData(nomsId: string, licenceId: string, user: User) {
    const licences = await this.licenceService.getLicencesByNomisIdsAndStatus([nomsId], [], user)
    const currentLicenceIndex = licences.findIndex(l => l.licenceId === parseInt(licenceId, 10))
    const statusCodesInUse: string[] = licences.map(l => l.licenceStatus.toString()).splice(currentLicenceIndex, 1)

    // multiple licences against an offender can be INACTIVE
    const availableCodes = Object.values(LicenceStatus)
      .filter((s: LicenceStatus) => s === LicenceStatus.INACTIVE || !statusCodesInUse.includes(s))
      .sort()

    return {
      currentLicence: licences[currentLicenceIndex],
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
