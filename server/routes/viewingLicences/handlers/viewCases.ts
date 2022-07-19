import { Request, Response } from 'express'
import moment from 'moment'
import _ from 'lodash'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import { convertToTitleCase } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'

export default class ViewAndPrintCaseRoutes {
  constructor(private readonly caseloadService: CaseloadService, private readonly prisonerService: PrisonerService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string

    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]

    const cases = await this.caseloadService.getOmuCaseload(user, prisonCaseloadToDisplay)
    const caseloadViewModel = cases
      .map(c => {
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: moment(c.nomisRecord.releaseDate || c.nomisRecord.conditionalReleaseDate).format('DD MMM YYYY'),
          licenceStatus: _.head(c.licences).status,
          isClickable:
            _.head(c.licences).status !== LicenceStatus.NOT_STARTED &&
            _.head(c.licences).status !== LicenceStatus.NOT_IN_PILOT &&
            _.head(c.licences).status !== LicenceStatus.OOS_RECALL &&
            _.head(c.licences).status !== LicenceStatus.OOS_BOTUS &&
            _.head(c.licences).status !== LicenceStatus.IN_PROGRESS,
        }
      })
      .filter(c => {
        const searchString = search?.toLowerCase().trim()
        if (!searchString) return true
        return (
          c.name.toLowerCase().includes(searchString) ||
          c.prisonerNumber?.toLowerCase().includes(searchString) ||
          c.probationPractitioner?.name.toLowerCase().includes(searchString)
        )
      })
      .sort((a, b) => {
        const crd1 = moment(a.releaseDate, 'DD MMM YYYY').unix()
        const crd2 = moment(b.releaseDate, 'DD MMM YYYY').unix()
        return crd1 - crd2
      })

    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    res.render('pages/view/cases', {
      cases: caseloadViewModel,
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
    })
  }
}
