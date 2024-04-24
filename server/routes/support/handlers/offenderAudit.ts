import { Request, Response } from 'express'
import { subYears } from 'date-fns'
import LicenceService from '../../../services/licenceService'
import { convertToTitleCase } from '../../../utils/utils'

export default class OffenderAuditRoutes {
  constructor(private readonly licenceServer: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId, licenceId } = req.params

    const { prisoner } = await this.licenceServer.getPrisonerDetail(nomsId, user)
    const audit = await this.licenceServer.getAuditEvents(
      parseInt(licenceId, 10),
      null,
      subYears(new Date(), 2),
      new Date(),
      user
    )

    res.render('pages/support/offenderAudit', {
      prisonerDetail: {
        id: nomsId,
        name: (!!prisoner && convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)) || '',
      },
      audit,
    })
  }
}
