import { Request, Response } from 'express'
import AuthRole from '../../../enumeration/authRole'
import { hasRole } from '../../../utils/utils'

export default class HomeRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const viewContext = {
      shouldShowCreateLicenceCard: hasRole(req.user, AuthRole.RESPONSIBLE_OFFICER),
      shouldShowApproveLicenceCard: hasRole(req.user, AuthRole.DECISION_MAKER),
      shouldShowMyCaseloadCard: hasRole(req.user, AuthRole.RESPONSIBLE_OFFICER),
    }
    res.render('pages/index', viewContext)
  }
}
