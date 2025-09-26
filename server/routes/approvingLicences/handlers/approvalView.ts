import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import ProbationService from '../../../services/probationService'
import HdcService from '../../../services/hdcService'
import { groupingBy } from '../../../utils/utils'
import LicenceKind from '../../../enumeration/LicenceKind'
import { nameToString } from '../../../data/deliusClient'
import { AdditionalCondition } from '../../../@types/licenceApiClientTypes'

export default class ApprovalViewRoutes {
  constructor(
    private readonly licenceService: LicenceService,
    private readonly probationService: ProbationService,
    private readonly hdcService: HdcService,
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { comUsername } = res.locals.licence

    // Check whether this licence is still in a SUBMITTED state - back button pressed - avoid re-approval
    if (licence?.statusCode === LicenceStatus.SUBMITTED) {
      // Recorded here as we do not know the reason for the fetchLicence in the API
      await this.licenceService.recordAuditEvent(
        `Licence viewed for approval for ${licence?.forename} ${licence?.surname}`,
        `ID ${licence?.id} type ${licence?.typeCode} status ${licence?.statusCode} version ${licence?.version}`,
        licence.id,
        new Date(),
        user,
      )

      const hdcLicenceData =
        licence.kind === LicenceKind.HDC ? await this.hdcService.getHdcLicenceData(licence.id) : null

      const comDetails = await this.probationService.getStaffDetailByUsername(comUsername)

      const returnPath = encodeURIComponent(`/licence/approve/id/${licence.id}/view`)

      res.render('pages/approve/view', {
        additionalConditions: groupingBy(licence.additionalLicenceConditions as AdditionalCondition[], 'code'),
        staffDetails: {
          name: nameToString(comDetails.name),
          telephone: comDetails?.telephoneNumber,
          email: comDetails?.email,
        },
        returnPath,
        hdcLicenceData,
      })
    } else {
      res.redirect(`/licence/approve/cases`)
    }
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, result } = req.body
    switch (result) {
      case 'reject': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.REJECTED, user)
        res.redirect(`/licence/approve/id/${licenceId}/confirm-rejected`)
        break
      }
      case 'approve': {
        await this.licenceService.updateStatus(licenceId, LicenceStatus.APPROVED, user)
        res.redirect(`/licence/approve/id/${licenceId}/confirm-approved`)
        break
      }
      default:
        // Cater for a cancel option? No way to avoid approval or rejection at present
        res.redirect(`/licence/approve/cases`)
    }
  }
}
