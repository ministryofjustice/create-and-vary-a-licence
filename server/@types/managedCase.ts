import { type OffenderDetail } from './probationSearchApiClientTypes'
import { type CommunityApiManagedOffender } from './communityClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import LicenceKind from '../enumeration/LicenceKind'
import type { CvlPrisoner, CvlFields } from './licenceApiClientTypes'

export type DeliusRecord = OffenderDetail & CommunityApiManagedOffender

export type ProbationPractitioner = {
  staffCode?: string
  staffIdentifier?: number
  name: string
}

export type Licence = {
  id?: number
  status: LicenceStatus
  kind?: LicenceKind
  type: LicenceType
  comUsername?: string
  dateCreated?: string
  approvedBy?: string
  approvedDate?: string
  versionOf?: number
  updatedByFullName?: string
  hardStopWarningDate?: Date
  hardStopDate?: Date
  licenceStartDate?: string
  releaseDate: Date
  isDueToBeReleasedInTheNextTwoWorkingDays: boolean
}

export type ApprovalLicence = {
  id?: number
  status: LicenceStatus
  kind?: LicenceKind
  type: LicenceType
  comUsername?: string
  dateCreated?: string
  approvedBy?: string
  approvedDate?: string
  versionOf?: number
  updatedByFullName?: string
  submittedByFullName: string
  isDueForEarlyRelease: boolean
  releaseDate: Date
  isDueToBeReleasedInTheNextTwoWorkingDays: boolean
}

export type GenericManagedCase<T> = {
  deliusRecord?: DeliusRecord
  nomisRecord?: CvlPrisoner
  licences?: T[]
  probationPractitioner?: ProbationPractitioner
  cvlFields: CvlFields
}
export type ManagedCase = GenericManagedCase<Licence>
