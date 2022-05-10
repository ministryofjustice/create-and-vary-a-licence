import { Request, Response } from 'express'
import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase } from '../../../utils/utils'

export default class OffenderLicencesRoutes {
  constructor(private readonly licenceServer: LicenceService, private readonly prisonerService: PrisonerService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params

    const prisonerDetail = _.head(await this.prisonerService.searchPrisonersByNomisIds([nomsId], user))
    const licences = await this.licenceServer.getLicencesByNomisIdsAndStatus([nomsId], [], user)

    res.render('pages/support/offenderLicences', {
      prisonerDetail: {
        id: nomsId,
        name: convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`),
      },
      licences,
    })
  }
}
