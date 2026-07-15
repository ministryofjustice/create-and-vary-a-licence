import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import type { LicenceIdParams } from '../../types/routeParams'
import { convertToTitleCase } from '../../../utils/utils'
import { NomsIdParams } from '../../types/routeParams'

export default class OffenderAuditRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request<NomsIdParams & LicenceIdParams>, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId, licenceId } = req.params

    const { prisoner } = await this.licenceService.getPrisonerDetail(nomsId, user)
    const audit = await this.licenceService.getAuditEvents(user, parseInt(licenceId, 10))

    res.render('pages/support/offenderAudit', {
      prisonerDetail: {
        id: nomsId,
        name: (!!prisoner && convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)) || '',
      },
      audit,
    })
  }
}
