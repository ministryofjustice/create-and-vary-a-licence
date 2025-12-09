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
    const enteredQueryTerm = req.query?.queryTerm as string
    const queryTerm = enteredQueryTerm?.trim() || ''
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
      inPrisonResults: inPrisonResults.map(caCase => {
        const link = this.getLink(caCase)
        const licenceStatus = this.getStatus(<LicenceStatus>caCase.licenceStatus)
        return {
          ...caCase,
          link,
          licenceStatus,
        }
      }),
      onProbationResults: onProbationResults.map(caCase => {
        const link = this.getLink(caCase)
        const licenceStatus = this.getStatus(<LicenceStatus>caCase.licenceStatus)
        return {
          ...caCase,
          link,
          licenceStatus,
        }
      }),
      attentionNeededResults: attentionNeededResults.map(caCase => {
        return {
          ...caCase,
          nomisLegalStatus: caCase.nomisLegalStatus,
          tabType: CaViewCasesTab[caCase.tabType],
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

  getLink = (caCase: CaCase): string => {
    if (
      !this.isClickable(
        <LicenceKind>caCase.kind,
        <LicenceStatus>caCase.licenceStatus,
        caCase.isInHardStopPeriod,
        caCase.tabType,
      )
    ) {
      return null
    }
    if (caCase.licenceStatus === LicenceStatus.TIMED_OUT) {
      if (caCase.kind === LicenceKind.TIME_SERVED) {
        return `/licence/time-served/create/nomisId/${caCase.prisonerNumber}/do-you-want-to-create-the-licence-on-this-service`
      }
      return `/licence/hard-stop/create/nomisId/${caCase.prisonerNumber}/confirm`
    }
    if (caCase.licenceId) {
      const query =
        caCase.licenceVersionOf && caCase.licenceStatus === LicenceStatus.SUBMITTED
          ? `?lastApprovedVersion=${caCase.licenceVersionOf}`
          : ''

      if (caCase.isInHardStopPeriod) {
        if (this.isEditableInHardStop(<LicenceKind>caCase.kind, <LicenceStatus>caCase.licenceStatus)) {
          return `/licence/hard-stop/id/${caCase.licenceId}/check-your-answers${query}`
        }
        if (this.isEditableInTimeServed(<LicenceKind>caCase.kind, <LicenceStatus>caCase.licenceStatus)) {
          return `/licence/time-served/id/${caCase.licenceId}/check-your-answers${query}`
        }
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
    if (
      isInHardStopPeriod &&
      (this.isEditableInHardStop(kind, licenceStatus) || this.isEditableInTimeServed(kind, licenceStatus))
    ) {
      return true
    }
    return !this.nonViewableStatuses.includes(licenceStatus)
  }

  private isEditableInHardStop = (kind: LicenceKind, licenceStatus: LicenceStatus) => {
    const inProgressHardStop = kind === LicenceKind.HARD_STOP && licenceStatus === LicenceStatus.IN_PROGRESS
    const notStarted = licenceStatus === LicenceStatus.TIMED_OUT
    return inProgressHardStop || notStarted
  }

  private isEditableInTimeServed = (kind: LicenceKind, licenceStatus: LicenceStatus) => {
    const inProgressTimeServed = kind === LicenceKind.TIME_SERVED && licenceStatus === LicenceStatus.IN_PROGRESS
    const notStarted = licenceStatus === LicenceStatus.TIMED_OUT
    return inProgressTimeServed || notStarted
  }
}
