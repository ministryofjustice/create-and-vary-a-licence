import { Request, Response } from 'express'
import _ from 'lodash'
import moment from 'moment'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase } from '../../../utils/utils'

export default class OffenderAuditRoutes {
  constructor(private readonly licenceServer: LicenceService, private readonly prisonerService: PrisonerService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId, licenceId } = req.params

    const prisonerDetail = _.head(await this.prisonerService.searchPrisonersByNomisIds([nomsId], user))
    const audit = await this.licenceServer.getAuditEvents(
      parseInt(licenceId, 10),
      null,
      moment().subtract(2, 'years').toDate(),
      moment().toDate(),
      user
    )

    res.render('pages/support/offenderAudit', {
      prisonerDetail: {
        id: nomsId,
        name: convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`),
      },
      audit,
    })
  }
}
