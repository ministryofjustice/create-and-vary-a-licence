import { Request, Response } from 'express'
import AuthRole from '../../../enumeration/authRole'
import { hasAuthSource, hasRole } from '../../../utils/utils'

export default class HomeRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const viewContext = {
      shouldShowCreateLicenceCard: hasRole(req.user, AuthRole.RESPONSIBLE_OFFICER) && hasAuthSource(req.user, 'delius'),
      shouldShowVaryLicenceCard: hasRole(req.user, AuthRole.RESPONSIBLE_OFFICER) && hasAuthSource(req.user, 'delius'),
      shouldShowApproveLicenceCard: hasRole(req.user, AuthRole.DECISION_MAKER) && hasAuthSource(req.user, 'nomis'),
      shouldShowViewOrPrintCard:
        (hasRole(req.user, AuthRole.CASE_ADMIN) && hasAuthSource(req.user, 'nomis')) ||
        // Temporarily removed for COM - UR request - will be reinstated later
        // hasRole(req.user, AuthRole.RESPONSIBLE_OFFICER) ||
        hasRole(req.user, AuthRole.READONLY),
      shouldShowMyCaseloadCard: hasRole(req.user, AuthRole.RESPONSIBLE_OFFICER), // TODO: Probably remove this?
      shouldShowVaryApprovalCard: hasRole(req.user, AuthRole.ASSISTANT_CHIEF) && hasAuthSource(req.user, 'delius'),
      shouldShowSupportCard: hasRole(req.user, AuthRole.SUPPORT),
      shouldShowDprCard: hasRole(req.user, AuthRole.REPORTS) || hasRole(req.user, AuthRole.SUPPORT),
    }
    res.render('pages/index', viewContext)
  }
}
