import { Request, Response } from 'express'
import _ from 'lodash'
import { getUnixTime } from 'date-fns'
import CaseloadService from '../../../services/caseloadService'
import PrisonerService from '../../../services/prisonerService'
import {
  convertToTitleCase,
  releaseDateLabel,
  selectReleaseDate,
  selectReleaseDateFromLicence,
} from '../../../utils/utils'
import LicenceService from '../../../services/licenceService'

export default class ApprovalCaseRoutes {
  constructor(
    private readonly caseloadService: CaseloadService,
    private readonly prisonerService: PrisonerService,
    private readonly licenceService: LicenceService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string

    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const cases = await this.caseloadService.getApproverCaseload(user, prisonCaseloadToDisplay)

    const caseloadLicences = await Promise.all(
      cases.map(c => {
        return this.licenceService.getLicence(_.head(c.licences).id.toString(), user)
      })
    )

    const caseloadViewModel = cases
      .map(c => {
        const licence = caseloadLicences.find(l => l?.id === _.head(c.licences).id)
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: licence ? selectReleaseDateFromLicence(licence) : selectReleaseDate(c.nomisRecord),
          releaseDateLabel: releaseDateLabel(licence, c.nomisRecord),
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
        const crd1 = getUnixTime(new Date(a.releaseDate))
        const crd2 = getUnixTime(new Date(b.releaseDate))
        return crd1 - crd2
      })

    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    res.render('pages/approve/cases', {
      cases: caseloadViewModel,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
    })
  }
}
