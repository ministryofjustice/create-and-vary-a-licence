import { Request, Response } from 'express'
import SearchService from '../../../services/searchService'
import PrisonerService from '../../../services/prisonerService'
import statusConfig from '../../../licences/licenceStatus'
import { CaCase, PrisonCaseAdminSearchResult } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import config from '../../../config'

export default class CaSearch {
  constructor(
    private readonly searchService: SearchService,
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
    const queryTerm = req.query?.queryTerm as string
    const { user } = res.locals
    const { caseloadsSelected = [] } = req.session

    let results: PrisonCaseAdminSearchResult

    if (queryTerm.length === 0) {
      results = {
        inPrisonResults: [],
        onProbationResults: [],
      }
    } else {
      const allPrisons = await this.prisonerService.getPrisons()
      const activeCaseload = allPrisons.filter(p => p.agencyId === user.activeCaseload)
      const prisonsToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload[0].agencyId]

      results = await this.searchService.getCaSearchResults(queryTerm, prisonsToDisplay)
    }

    const worksAtMoreThanOnePrison = user.prisonCaseload.length > 1
    const { inPrisonResults, onProbationResults } = results

    const backLink = '/licence/view/cases'

    const activeTab = inPrisonResults.length >= onProbationResults.length ? '#people-in-prison' : '#people-on-probation'

    const tabParameters = {
      activeTab,
      prison: {
        tabId: 'tab-heading-prison',
        tabHeading: 'People in prison',
        resultsCount: inPrisonResults.length,
      },
      probation: {
        tabId: 'tab-heading-probation',
        tabHeading: 'People on probation',
        resultsCount: onProbationResults.length,
      },
    }

    const { recallsEnabled } = config
    return res.render('pages/search/caSearch/caSearch', {
      queryTerm,
      backLink,
      statusConfig,
      tabParameters,
      inPrisonResults: inPrisonResults.map(res => {
        const link = this.getLink(res)
        const licenceStatus = this.getStatus(<LicenceStatus>res.licenceStatus)
        return {
          ...res,
          link,
          licenceStatus,
        }
      }),
      onProbationResults: onProbationResults.map(res => {
        const link = this.getLink(res)
        const licenceStatus = this.getStatus(<LicenceStatus>res.licenceStatus)
        return {
          ...res,
          link,
          licenceStatus,
        }
      }),
      worksAtMoreThanOnePrison,
      recallsEnabled,
    })
  }

  private getStatus = (licenceStatus: LicenceStatus) => {
    return licenceStatus === LicenceStatus.TIMED_OUT ? LicenceStatus.NOT_STARTED : licenceStatus
  }

  private getLink = (licence: CaCase): string => {
    if (
      !this.isClickable(<LicenceKind>licence.kind, <LicenceStatus>licence.licenceStatus, licence.isInHardStopPeriod)
    ) {
      return null
    }
    if (licence.licenceStatus === LicenceStatus.TIMED_OUT) {
      return `/licence/hard-stop/create/nomisId/${licence.prisonerNumber}/confirm`
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

  private isClickable = (kind: LicenceKind, licenceStatus: LicenceStatus, isInHardStopPeriod: boolean): boolean => {
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
