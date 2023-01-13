import { Request, Response } from 'express'
import { getUnixTime } from 'date-fns'
import _ from 'lodash'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import {
  convertToTitleCase,
  selectReleaseDate,
  selectReleaseDateFromLicence,
  releaseDateLabel,
} from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import LicenceService from '../../../services/licenceService'

export default class ViewAndPrintCaseRoutes {
  constructor(
    private readonly caseloadService: CaseloadService,
    private readonly prisonerService: PrisonerService,
    private readonly licenceService: LicenceService
  ) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const search = req.query.search as string
    const view = req.query.view || 'prison'
    const probationView = view === 'probation'
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const caselist = await this.caseloadService.getOmuCaseload(user, prisonCaseloadToDisplay)

    const casesToView = view === 'prison' ? caselist.getPrisonView() : caselist.getProbationView()

    const caseloadLicences = await Promise.all(
      casesToView.unwrap().map(c => {
        return this.licenceService.getLicence(_.head(c.licences).id.toString(), user)
      })
    )

    const caseloadViewModel = casesToView
      .unwrap()
      .map(c => {
        const licence = caseloadLicences.find(l => l?.id === _.head(c.licences).id)
        return {
          licenceId: _.head(c.licences).id,
          name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
          prisonerNumber: c.nomisRecord.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: licence ? selectReleaseDateFromLicence(licence) : selectReleaseDate(c.nomisRecord),
          releaseDateLabel: releaseDateLabel(licence, c.nomisRecord),
          licenceStatus: _.head(c.licences).status,
          isClickable:
            _.head(c.licences).status !== LicenceStatus.NOT_STARTED &&
            _.head(c.licences).status !== LicenceStatus.NOT_IN_PILOT &&
            _.head(c.licences).status !== LicenceStatus.OOS_RECALL &&
            _.head(c.licences).status !== LicenceStatus.OOS_BOTUS &&
            _.head(c.licences).status !== LicenceStatus.IN_PROGRESS &&
            _.head(c.licences).status !== LicenceStatus.VARIATION_IN_PROGRESS &&
            _.head(c.licences).status !== LicenceStatus.VARIATION_APPROVED &&
            _.head(c.licences).status !== LicenceStatus.VARIATION_SUBMITTED,
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
        return view === 'prison' ? crd1 - crd2 : crd2 - crd1
      })

    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

    res.render('pages/view/cases', {
      cases: caseloadViewModel,
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
    })
  }

  GET_WITH_EXCLUSIONS = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]

    const caselist = await this.caseloadService.getOmuCaseload(user, prisonCaseloadToDisplay)
    const cases = req.query.view === 'probation' ? caselist.getProbationView() : caselist.getPrisonView()
    res.header('Content-Type', 'application/json')
    res.send(JSON.stringify(cases, null, 4))
  }
}
