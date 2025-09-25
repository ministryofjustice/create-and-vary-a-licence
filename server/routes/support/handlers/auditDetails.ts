import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'

export default class AuditDetailsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId, licenceId, auditEventId } = req.params
    const audit = await this.licenceService.getAuditEvents(user, parseInt(licenceId, 10))

    const auditEvent = audit.find(a => a.id.toString() === auditEventId)

    res.render('pages/support/auditDetails', {
      nomsId,
      auditEvent,
    })
  }
}
