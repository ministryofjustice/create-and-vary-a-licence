import { Request, Response } from 'express'
import statusConfig from '../../../licences/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import CaCaseloadService from '../../../services/lists/caCaseloadService'
import { LicenceStatus, LicenceKind, CaViewCasesTab } from '../../../enumeration'
import config from '../../../config'

import { CaCase } from '../../../@types/licenceApiClientTypes'

export default class ViewAndPrintCaseRoutes {
  constructor(
    private readonly caseloadService: CaCaseloadService,
    private readonly prisonerService: PrisonerService,
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
    const search = req.query?.search as string
    const view = req.query?.view || 'prison'
    const probationView = view === 'probation'
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session
    const { timeServedEnabled } = config
    const hasMultipleCaseloadsInNomis = user.prisonCaseload.length > 1
    const allPrisons = await this.prisonerService.getPrisons()
    const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
    const prisonCaseloadToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]
    const searchString = search?.toLowerCase().trim()
    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))
    const cases =
      view === 'prison'
        ? await this.caseloadService.getPrisonOmuCaseload(user, prisonCaseloadToDisplay, searchString)
        : await this.caseloadService.getProbationOmuCaseload(user, prisonCaseloadToDisplay, searchString)

    res.render('pages/view/cases', {
      cases: cases.map(c => {
        const link = this.getLink(c)
        const licenceStatus = this.getStatus(<LicenceStatus>c.licenceStatus)
        return {
          licenceId: c.licenceId,
          licenceVersionOf: c.licenceVersionOf,
          name: c.name,
          prisonerNumber: c.prisonerNumber,
          probationPractitioner: c.probationPractitioner,
          releaseDate: c.releaseDate,
          releaseDateLabel: c.releaseDateLabel,
          tabType: CaViewCasesTab[c.tabType],
          nomisLegalStatus: c.nomisLegalStatus,
          lastWorkedOnBy: c.lastWorkedOnBy,
          link,
          licenceStatus,
          kind: c.kind,
        }
      }),
      CaViewCasesTab,
      showAttentionNeededTab: cases.some(c => c.tabType === 'ATTENTION_NEEDED'),
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
      timeServedEnabled,
    })
  }

  private getStatus = (licenceStatus: LicenceStatus) => {
    return licenceStatus === LicenceStatus.TIMED_OUT ? LicenceStatus.NOT_STARTED : licenceStatus
  }

  private getLink = (licence: CaCase): string => {
    if (
      !this.isClickable(
        <LicenceKind>licence.kind,
        <LicenceStatus>licence.licenceStatus,
        licence.isInHardStopPeriod,
        licence.tabType,
      )
    ) {
      return null
    }
    if (licence.licenceStatus === LicenceStatus.TIMED_OUT) {
      return `/licence/hard-stop/create/nomisId/${licence.prisonerNumber}/confirm?hardStopKind=${licence.hardStopKind}`
    }
    if (licence.licenceId) {
      const query =
        licence.licenceVersionOf && licence.licenceStatus === LicenceStatus.SUBMITTED
          ? `?lastApprovedVersion=${licence.licenceVersionOf}`
          : ''

      return licence.isInHardStopPeriod &&
        this.isEditableInHardStop(<LicenceKind>licence.kind, <LicenceStatus>licence.licenceStatus)
        ? `/licence/hard-stop/id/${licence.licenceId}/check-your-answers${query}`
        : `/licence/view/id/${licence.licenceId}/show${query}`
    }

    return null
  }

  private isClickable = (
    kind: LicenceKind,
    licenceStatus: LicenceStatus,
    isInHardStopPeriod: boolean,
    tabType: string,
  ): boolean => {
    if (tabType === 'ATTENTION_NEEDED') {
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
