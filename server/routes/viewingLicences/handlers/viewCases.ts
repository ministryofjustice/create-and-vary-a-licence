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
    const { timeServedEnabled, timeServedEnabledPrisons } = config

    res.render('pages/view/cases', {
      cases: cases.map(c => {
        const link = this.getLink(c)
        const licenceStatus = this.getStatus(<LicenceStatus>c.licenceStatus, c.hasNomisLicence)
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
          hardStopKind: c.hardStopKind,
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

  private getLink = (licence: CaCase): string => {
    const licenceStatus = <LicenceStatus>licence.licenceStatus

    if (!this.isClickable(<LicenceKind>licence.kind, licenceStatus, licence.isInHardStopPeriod, licence.tabType)) {
      return null
    }
    if (licenceStatus === LicenceStatus.TIMED_OUT) {
      return licence.hardStopKind === LicenceKind.TIME_SERVED
        ? `/licence/time-served/create/nomisId/${licence.prisonerNumber}/do-you-want-to-create-the-licence-on-this-service`
        : `/licence/hard-stop/create/nomisId/${licence.prisonerNumber}/confirm`
    }
    if (licence.licenceId) {
      const query =
        licence.licenceVersionOf && licenceStatus === LicenceStatus.SUBMITTED
          ? `?lastApprovedVersion=${licence.licenceVersionOf}`
          : ''

      if (licence.isInHardStopPeriod && this.isEditableTimedOutStatus(licenceStatus)) {
        const timedOutKind = licence.kind === LicenceKind.TIME_SERVED ? 'time-served' : 'hard-stop'
        return `/licence/${timedOutKind}/id/${licence.licenceId}/check-your-answers${query}`
      }
      return `/licence/view/id/${licence.licenceId}/show${query}`
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

  private isEditableInHardStop = (kind: LicenceKind, status: LicenceStatus): boolean => {
    return this.isTimedOutKinds(kind) && this.isEditableTimedOutStatus(status)
  }

  private isEditableTimedOutStatus = (status: LicenceStatus): boolean => EDITABLE_TIMED_OUT_STATUSES.includes(status)

  private isTimedOutKinds = (kind: LicenceKind): boolean => TIMED_OUT_KINDS.includes(kind)
}
