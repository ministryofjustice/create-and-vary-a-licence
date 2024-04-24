import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import { convertToTitleCase } from '../../../utils/utils'
import getUrlAccessByStatus from '../../../utils/urlAccessByStatus'

export default class OffenderLicencesRoutes {
  constructor(private readonly licenceServer: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { nomsId } = req.params

    const { prisoner } = await this.licenceServer.getPrisonerDetail(nomsId, user)
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
        name: (!!prisoner && convertToTitleCase(`${prisoner.firstName} ${prisoner.lastName}`)) || '',
      },
      licences,
    })
  }
}
