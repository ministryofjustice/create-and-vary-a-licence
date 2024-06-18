import { Request, Response } from 'express'
import statusConfig from '../../../licences/licenceStatus'
import { CaViewCasesTab } from '../../../utils/utils'
import PrisonerService from '../../../services/prisonerService'
import CaCaseloadService from '../../../services/lists/caCaseloadService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceKind from '../../../enumeration/LicenceKind'

export default class ViewAndPrintCaseRoutes {
  constructor(
    private readonly caseloadService: CaCaseloadService,
    private readonly prisonerService: PrisonerService
  ) {}

  nonViewableStatuses = [
    LicenceStatus.NOT_IN_PILOT,
    LicenceStatus.OOS_RECALL,
    LicenceStatus.OOS_BOTUS,
    LicenceStatus.VARIATION_IN_PROGRESS,
    LicenceStatus.VARIATION_APPROVED,
    LicenceStatus.VARIATION_SUBMITTED,
    LicenceStatus.NOT_STARTED,
    LicenceStatus.IN_PROGRESS,
  ]

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
    const searchString = search?.toLowerCase().trim()
    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))
    const { cases, showAttentionNeededTab } =
      view === 'prison'
        ? await this.caseloadService.getPrisonView(user, prisonCaseloadToDisplay, searchString)
        : await this.caseloadService.getProbationView(user, prisonCaseloadToDisplay, searchString)

    res.render('pages/view/cases', {
      cases: cases.map(c => {
        const link = this.getLink(
          c.kind,
          c.licenceId,
          c.licenceStatus,
          c.licenceVersionOf,
          c.isInHardStopPeriod,
          c.prisonerNumber,
          c.tabType
        )
        const licenceStatus = this.getStatus(c.licenceStatus)
        return {
          licenceId: c.licenceId,
          licenceVersionOf: c.licenceVersionOf,
          name: c.name,
          prisonerNumber: c.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: c.releaseDate,
          releaseDateLabel: c.releaseDateLabel,
          tabType: c.tabType,
          nomisLegalStatus: c.nomisLegalStatus,
          lastWorkedOnBy: c.lastWorkedOnBy,
          isDueForEarlyRelease: c.isDueForEarlyRelease,
          link,
          licenceStatus,
        }
      }),
      CaViewCasesTab,
      showAttentionNeededTab,
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
    })
  }

  private getStatus = (licenceStatus: LicenceStatus) => {
    return licenceStatus === LicenceStatus.TIMED_OUT ? LicenceStatus.NOT_STARTED : licenceStatus
  }

  private getLink = (
    kind: LicenceKind,
    licenceId: number,
    licenceStatus: LicenceStatus,
    licenceVersionOf: number,
    isInHardStopPeriod: boolean,
    prisonerNumber: string,
    tabType: CaViewCasesTab
  ): string => {
    if (!this.isClickable(kind, licenceStatus, isInHardStopPeriod, tabType)) {
      return null
    }
    if (licenceStatus === LicenceStatus.TIMED_OUT) {
      return `/licence/hard-stop/create/nomisId/${prisonerNumber}/confirm`
    }
    if (licenceId) {
      const query =
        licenceVersionOf && licenceStatus === LicenceStatus.SUBMITTED ? `?lastApprovedVersion=${licenceVersionOf}` : ''

      return isInHardStopPeriod && this.isEditableInHardStop(kind, licenceStatus)
        ? `/licence/hard-stop/id/${licenceId}/check-your-answers${query}`
        : `/licence/view/id/${licenceId}/show${query}`
    }

    return null
  }

  private isClickable = (
    kind: LicenceKind,
    licenceStatus: LicenceStatus,
    isInHardStopPeriod: boolean,
    tabType: CaViewCasesTab
  ): boolean => {
    if (tabType === CaViewCasesTab.ATTENTION_NEEDED) {
      return false
    }

    if (isInHardStopPeriod && this.isEditableInHardStop(kind, licenceStatus)) {
      return true
    }
    return !this.nonViewableStatuses.includes(licenceStatus)
  }

  private isEditableInHardStop = (kind: LicenceKind, licenceStatus: LicenceStatus) => {
    const inProgressHardStop = kind === LicenceKind.HARD_STOP && licenceStatus === LicenceStatus.IN_PROGRESS
    const notStarted = licenceStatus === LicenceStatus.TIMED_OUT
    return inProgressHardStop || notStarted
  }
}
