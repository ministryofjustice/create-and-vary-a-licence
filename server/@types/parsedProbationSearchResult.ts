export type ParsedProbationSearchResult = {
  results: FoundProbationRecord[]
  inPrisonCount: number
  onProbationCount: number
}

type FoundProbationRecord = {
  kind?: 'CRD' | 'VARIATION' | 'HARD_STOP'
  name: string
  crn?: string
  nomisId?: string
  comName?: string
  comStaffCode?: string
  teamName?: string
  releaseDate?: string
  hardStopDate?: Date
  hardStopWarningDate?: Date
  isInHardStopPeriod: boolean
  isDueForEarlyRelease: boolean
  isDueToBeReleasedInTheNextTwoWorkingDays: boolean
  licenceId?: number
  versionOf?: number
  licenceType?: 'AP' | 'AP_PSS' | 'PSS'
  licenceStatus?:
    | 'IN_PROGRESS'
    | 'SUBMITTED'
    | 'APPROVED'
    | 'ACTIVE'
    | 'REJECTED'
    | 'INACTIVE'
    | 'RECALLED'
    | 'VARIATION_IN_PROGRESS'
    | 'VARIATION_SUBMITTED'
    | 'VARIATION_REJECTED'
    | 'VARIATION_APPROVED'
    | 'NOT_STARTED'
    | 'TIMED_OUT'
  isOnProbation?: boolean
  releaseDateLabel?: string
  isReviewNeeded?: boolean
}
