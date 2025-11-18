import { Request, Response } from 'express'
import PrisonerService from '../../../services/prisonerService'
import SearchService from '../../../services/searchService'
import statusConfig from '../../../licences/licenceStatus'
import { CaCase, PrisonCaseAdminSearchResult } from '../../../@types/licenceApiClientTypes'
import LicenceKind from '../../../enumeration/LicenceKind'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { CaViewCasesTab } from '../../../enumeration'
import { getFirstMaxValueKey } from '../../../utils/utils'

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
    const { hasMultipleCaseloadsInNomis, prisonCaseloadToDisplay, hasSelectedMultiplePrisonCaseloads } = res.locals.user

    const changeLocationHref =
      queryTerm.length > 0 ? `/licence/view/change-location?queryTerm=${queryTerm}` : '/licence/view/change-location'

    let results: PrisonCaseAdminSearchResult

    if (queryTerm.length === 0) {
      results = {
        inPrisonResults: [],
        onProbationResults: [],
        attentionNeededResults: [],
      }
    } else {
      results = await this.searchService.getCaSearchResults(queryTerm, prisonCaseloadToDisplay)
    }

    const { inPrisonResults, onProbationResults, attentionNeededResults } = results

    const backLink = '/licence/view/cases'

    const numberOfTabResults = [
      { key: '#people-in-prison', count: inPrisonResults.length },
      { key: '#attention-needed', count: attentionNeededResults.length },
      { key: '#people-on-probation', count: onProbationResults.length },
    ]

    const tabParameters = {
      activeTab: getFirstMaxValueKey(numberOfTabResults),
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
        resultsCount: attentionNeededResults.length,
      },
    }

    const allPrisons = await this.prisonerService.getPrisons()
    const prisonsToDisplay = allPrisons.filter(p => prisonCaseloadToDisplay.includes(p.agencyId))

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
          nomisLegalStatus: res.nomisLegalStatus,
          tabType: CaViewCasesTab[res.tabType],
        }
      }),
      CaViewCasesTab,
      showAttentionNeededTab: attentionNeededResults.length > 0,
      hasMultipleCaseloadsInNomis,
      hasSelectedMultiplePrisonCaseloads,
      prisonsToDisplay,
      changeLocationHref,
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
