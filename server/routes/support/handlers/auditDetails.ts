import { Request, Response } from 'express'
import { subYears } from 'date-fns'
import LicenceService from '../../../services/licenceService'

export default class AuditDetailsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, auditEventId } = req.params
    const audit = await this.licenceService.getAuditEvents(
      parseInt(licenceId, 10),
      null,
      subYears(new Date(), 2),
      new Date(),
      user,
    )

    const auditEvent = audit.find(a => a.id.toString() === auditEventId)

    res.render('pages/support/auditDetails', {
      auditEvent,
    })
  }
}
