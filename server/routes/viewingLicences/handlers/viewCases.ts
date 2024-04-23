import { Request, Response } from 'express'
import { format, getUnixTime } from 'date-fns'
import _ from 'lodash'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import {
  convertToTitleCase,
  selectReleaseDate,
  determineComCreateCasesTab,
  ComCreateCaseTab,
} from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import config from '../../../config'

export default class ViewAndPrintCaseRoutes {
  constructor(
    private readonly caseloadService: CaseloadService,
    private readonly prisonerService: PrisonerService
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

    const caseloadViewModel = casesToView.unwrap().map(c => {
      let latestLicence = _.head(c.licences)
      if (!probationView && c.licences.length > 1) {
        latestLicence = c.licences.find(
          l => l.status === LicenceStatus.SUBMITTED || l.status === LicenceStatus.IN_PROGRESS
        )
      }
      const releaseDate = selectReleaseDate(c.nomisRecord)
      const tabType = determineComCreateCasesTab(latestLicence, c.nomisRecord, c.cvlFields)
      return {
        licenceId: latestLicence.id,
        licenceVersionOf: latestLicence.versionOf,
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        prisonerNumber: c.nomisRecord.prisonerNumber,
        probationPractitioner: c.probationPractitioner,
        releaseDate: releaseDate ? format(releaseDate, 'dd MMM yyyy') : 'not found',
        releaseDateLabel: c.nomisRecord.confirmedReleaseDate ? 'Confirmed release date' : 'CRD',
        licenceStatus: latestLicence.status,
        tabType,
        nomisLegalStatus: c.nomisRecord?.legalStatus,
        isClickable:
          config.hardStopEnabled && tabType === ComCreateCaseTab.ATTENTION_NEEDED
            ? false
            : latestLicence.status !== LicenceStatus.NOT_STARTED &&
              latestLicence.status !== LicenceStatus.NOT_IN_PILOT &&
              latestLicence.status !== LicenceStatus.OOS_RECALL &&
              latestLicence.status !== LicenceStatus.OOS_BOTUS &&
              latestLicence.status !== LicenceStatus.IN_PROGRESS &&
              latestLicence.status !== LicenceStatus.VARIATION_IN_PROGRESS &&
              latestLicence.status !== LicenceStatus.VARIATION_APPROVED &&
              latestLicence.status !== LicenceStatus.VARIATION_SUBMITTED,
        lastWorkedOnBy: latestLicence?.updatedByFullName,
        isDueForEarlyRelease: c.cvlFields.isDueForEarlyRelease,
      }
    })

    const showAttentionNeededTab = caseloadViewModel.some(e => e.tabType === ComCreateCaseTab.ATTENTION_NEEDED)
    const caseloadSearchResult = caseloadViewModel
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
      cases: caseloadSearchResult,
      ComCreateCaseTab,
      showAttentionNeededTab,
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
