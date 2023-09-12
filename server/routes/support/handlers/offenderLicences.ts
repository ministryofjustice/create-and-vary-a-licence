import { Request, Response } from 'express'
import _ from 'lodash'
import LicenceService from '../../../services/licenceService'
import PrisonerService from '../../../services/prisonerService'
import { convertToTitleCase } from '../../../utils/utils'
import getUrlAccessByStatus from '../../../utils/urlAccessByStatus'

export default class OffenderLicencesRoutes {
  constructor(
    private readonly licenceServer: LicenceService,
    private readonly prisonerService: PrisonerService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params

    const prisonerDetail = _.head(await this.prisonerService.searchPrisonersByNomisIds([nomsId], user))
    const licenceSummaries = await this.licenceServer.getLicencesByNomisIdsAndStatus([nomsId], [], user)

    const licences = licenceSummaries.map(licence => {
      const viewable = getUrlAccessByStatus(
        `/licence/view/id/${licence.licenceId}/pdf-print`,
        licence.licenceId,
        licence.licenceStatus,
        user.username
      )
      return {
        ...licence,
        viewable,
      }
    })

    res.render('pages/support/offenderLicences', {
      prisonerDetail: {
        id: nomsId,
        name: convertToTitleCase(`${prisonerDetail.firstName} ${prisonerDetail.lastName}`),
      },
      licences,
    })
  }
}
