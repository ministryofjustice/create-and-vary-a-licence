import { Request, Response } from 'express'
import { format, getUnixTime } from 'date-fns'
import statusConfig from '../../../licences/licenceStatus'
import { convertToTitleCase, selectReleaseDate, determineCaViewCasesTab, CaViewCasesTab } from '../../../utils/utils'
import LicenceStatus from '../../../enumeration/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import { Licence } from '../../../@types/managedCase'
import { CvlFields, CvlPrisoner } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'
import CaCaseloadService from '../../../services/lists/caCaseloadService'

const nonViewableStatuses = [
  LicenceStatus.NOT_IN_PILOT,
  LicenceStatus.OOS_RECALL,
  LicenceStatus.OOS_BOTUS,
  LicenceStatus.VARIATION_IN_PROGRESS,
  LicenceStatus.VARIATION_APPROVED,
  LicenceStatus.VARIATION_SUBMITTED,
  LicenceStatus.NOT_STARTED,
  LicenceStatus.IN_PROGRESS,
]

export default class ViewAndPrintCaseRoutes {
  constructor(
    private readonly caseloadService: CaCaseloadService,
    private readonly prisonerService: PrisonerService
  ) {}

  isEditableInHardStop = (licence: Licence) => {
    const inProgressHardStop = licence.kind === LicenceKind.HARD_STOP && licence.status === LicenceStatus.IN_PROGRESS
    const notStarted = licence.status === LicenceStatus.TIMED_OUT
    return inProgressHardStop || notStarted
  }

  isClickable = (licence: Licence, cvlField: CvlFields, tabType: CaViewCasesTab): boolean => {
    if (tabType === CaViewCasesTab.ATTENTION_NEEDED) {
      return false
    }

    if (cvlField.isInHardStopPeriod && this.isEditableInHardStop(licence)) {
      return true
    }
    return !nonViewableStatuses.includes(licence.status)
  }

  getLink = (licence: Licence, cvlFields: CvlFields, prisoner: CvlPrisoner, tabType: CaViewCasesTab): string => {
    if (!this.isClickable(licence, cvlFields, tabType)) {
      return null
    }
    if (licence.status === LicenceStatus.TIMED_OUT) {
      return `/licence/hard-stop/create/nomisId/${prisoner.prisonerNumber}/confirm`
    }
    if (licence.id) {
      const query =
        licence.versionOf && licence.status === LicenceStatus.SUBMITTED
          ? `?lastApprovedVersion=${licence.versionOf}`
          : ''

      return cvlFields.isInHardStopPeriod && this.isEditableInHardStop(licence)
        ? `/licence/hard-stop/id/${licence.id}/check-your-answers${query}`
        : `/licence/view/id/${licence.id}/show${query}`
    }

    return null
  }

  getStatus = (licence: Licence) => {
    return licence.status === LicenceStatus.TIMED_OUT ? LicenceStatus.NOT_STARTED : licence.status
  }

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
    const casesToView =
      view === 'prison'
        ? await this.caseloadService.getPrisonView(user, prisonCaseloadToDisplay)
        : await this.caseloadService.getProbationView(user, prisonCaseloadToDisplay)

    const caseloadViewModel = casesToView.map(c => {
      const releaseDate = c.licence?.releaseDate || selectReleaseDate(c.nomisRecord)
      const tabType = determineCaViewCasesTab(c.licence, c.nomisRecord, c.cvlFields)
      return {
        licenceId: c.licence.id,
        licenceVersionOf: c.licence.versionOf,
        name: convertToTitleCase(`${c.nomisRecord.firstName} ${c.nomisRecord.lastName}`.trim()),
        prisonerNumber: c.nomisRecord.prisonerNumber,
        probationPractitioner: c.probationPractitioner,
        releaseDate: releaseDate ? format(releaseDate, 'dd MMM yyyy') : 'not found',
        releaseDateLabel: c.nomisRecord.confirmedReleaseDate ? 'Confirmed release date' : 'CRD',
        licenceStatus: this.getStatus(c.licence),
        tabType,
        nomisLegalStatus: c.nomisRecord?.legalStatus,
        link: this.getLink(c.licence, c.cvlFields, c.nomisRecord, tabType),
        lastWorkedOnBy: c.licence?.updatedByFullName,
        isDueForEarlyRelease: c.cvlFields.isDueForEarlyRelease,
      }
    })

    const showAttentionNeededTab = caseloadViewModel.some(e => e.tabType === CaViewCasesTab.ATTENTION_NEEDED)
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
      CaViewCasesTab,
      showAttentionNeededTab,
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
    })
  }
}
