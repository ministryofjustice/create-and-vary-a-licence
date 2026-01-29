import { Request, Response } from 'express'
import config from '../../../config'
import statusConfig from '../../../licences/licenceStatus'
import PrisonerService from '../../../services/prisonerService'
import CaCaseloadService from '../../../services/lists/caCaseloadService'
import { LicenceStatus, LicenceKind, CaViewCasesTab } from '../../../enumeration'

import { CaCase } from '../../../@types/licenceApiClientTypes'

const TIMED_OUT_KINDS = [LicenceKind.HARD_STOP, LicenceKind.TIME_SERVED]
const EDITABLE_TIMED_OUT_STATUSES = [LicenceStatus.IN_PROGRESS, LicenceStatus.TIMED_OUT]

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
    const hasSelectedNomisForTimeServedLicenceCreation =
      req.flash('hasSelectedNomisForTimeServedLicenceCreation')[0] === 'true'
    const { enabled: timeServedEnabled, prisons: timeServedEnabledPrisons } = config.timeServed

    res.render('pages/view/cases', {
      cases: cases.map(caCase => {
        const link = this.getLink(caCase)
        const licenceStatus = this.getStatus(<LicenceStatus>caCase.licenceStatus, caCase.hasNomisLicence)
        return {
          licenceId: caCase.licenceId,
          licenceVersionOf: caCase.licenceVersionOf,
          name: caCase.name,
          prisonerNumber: caCase.prisonerNumber,
          probationPractitioner: caCase.probationPractitioner,
          releaseDate: caCase.releaseDate,
          releaseDateLabel: caCase.releaseDateLabel,
          tabType: CaViewCasesTab[caCase.tabType],
          nomisLegalStatus: caCase.nomisLegalStatus,
          lastWorkedOnBy: caCase.lastWorkedOnBy,
          link,
          licenceStatus,
          kind: caCase.kind,
        }
      }),
      CaViewCasesTab,
      showAttentionNeededTab: cases.some(c => c.tabType === 'ATTENTION_NEEDED'),
      statusConfig,
      search,
      prisonsToDisplay,
      hasMultipleCaseloadsInNomis,
      probationView,
      hasSelectedNomisForTimeServedLicenceCreation,
      isTimeServedEnabled:
        timeServedEnabled && timeServedEnabledPrisons.some(prison => prisonCaseloadToDisplay.includes(prison)),
    })
  }

  private getStatus = (licenceStatus: LicenceStatus, hasNomisLicence: boolean): LicenceStatus => {
    if (licenceStatus !== LicenceStatus.TIMED_OUT) {
      return licenceStatus
    }

    return hasNomisLicence ? LicenceStatus.NOMIS_LICENCE : LicenceStatus.NOT_STARTED
  }

  private getLink = (caCase: CaCase): string => {
    const licenceStatus = <LicenceStatus>caCase.licenceStatus

    if (!this.isClickable(<LicenceKind>caCase.kind, licenceStatus, caCase.isInHardStopPeriod, caCase.tabType)) {
      return null
    }
    if (licenceStatus === LicenceStatus.TIMED_OUT) {
      return caCase.kind === LicenceKind.TIME_SERVED
        ? `/licence/time-served/create/nomisId/${caCase.prisonerNumber}/do-you-want-to-create-the-licence-on-this-service`
        : `/licence/hard-stop/create/nomisId/${caCase.prisonerNumber}/confirm`
    }
    if (caCase.licenceId) {
      const query =
        caCase.licenceVersionOf && licenceStatus === LicenceStatus.SUBMITTED
          ? `?lastApprovedVersion=${caCase.licenceVersionOf}`
          : ''

      if (
        (caCase.isInHardStopPeriod || caCase.kind === LicenceKind.TIME_SERVED) &&
        this.isEditableTimedOutStatus(licenceStatus)
      ) {
        const timedOutKind = caCase.kind === LicenceKind.TIME_SERVED ? 'time-served' : 'hard-stop'
        return `/licence/${timedOutKind}/id/${caCase.licenceId}/check-your-answers${query}`
      }
      return `/licence/view/id/${caCase.licenceId}/show${query}`
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

    if ((kind === LicenceKind.TIME_SERVED || isInHardStopPeriod) && this.isEditableInHardStop(kind, licenceStatus)) {
      return true
    }
    return !this.nonViewableStatuses.includes(licenceStatus)
  }

  private isEditableInHardStop = (kind: LicenceKind, status: LicenceStatus): boolean => {
    return this.isTimedOutKinds(kind) && this.isEditableTimedOutStatus(status)
  }

  private isEditableTimedOutStatus = (status: LicenceStatus): boolean => EDITABLE_TIMED_OUT_STATUSES.includes(status)

  private isTimedOutKinds = (kind: LicenceKind): boolean => TIMED_OUT_KINDS.includes(kind)
}
