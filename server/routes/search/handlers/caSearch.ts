import { Request, Response } from 'express'
import { format } from 'date-fns/format'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'
import { parseCvlDate } from '../../../utils/utils'
import { CaCase, PrisonCaseAdminSearchResult } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { CaViewCasesTab } from '../../../enumeration'
import config from '../../../config'

export default class CaSearch {
  constructor(private readonly searchService: SearchService) {}

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
      const { activeCaseload } = user
      const prisonsToDisplay = caseloadsSelected.length ? caseloadsSelected : [activeCaseload]

      results = await this.searchService.getCaSearchResults(queryTerm, prisonsToDisplay)
    }

    const hasSelectedMultiplePrisonCaseloads = caseloadsSelected.length > 1
    const { inPrisonResults, onProbationResults } = results
    const attentionNeededResults = inPrisonResults.filter(res => res.tabType === 'ATTENTION_NEEDED')

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
      attentionNeeded: {
        tabId: 'tab-heading-attention-needed',
        tabHeading: 'Attention needed',
        resultsCount: attentionNeededResults.length,
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
      attentionNeededResults: attentionNeededResults.map(res => {
        return {
          ...res,
          releaseDate: res.releaseDate ? format(parseCvlDate(res.releaseDate), 'dd MMM yyyy') : 'not found',
          nomisLegalStatus: res.nomisLegalStatus,
          tabType: CaViewCasesTab[res.tabType],
        }
      }),
      CaViewCasesTab,
      showAttentionNeededTab: attentionNeededResults.length > 0,
      hasSelectedMultiplePrisonCaseloads,
      recallsEnabled,
      isSearchPageView: true,
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
