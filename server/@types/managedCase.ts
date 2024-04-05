import { Prisoner } from './prisonerSearchApiClientTypes'
import { OffenderDetail } from './probationSearchApiClientTypes'
import { CommunityApiManagedOffender } from './communityClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import LicenceKind from '../enumeration/LicenceKind'

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
  hardStopCutoffDate?: Date
  licenceStartDate?: string
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
  hardStopWarningDate?: Date
  hardStopCutoffDate?: Date
}

export type GenericManagedCase<T> = {
  deliusRecord?: DeliusRecord
  nomisRecord?: Prisoner
  licences?: T[]
  probationPractitioner?: ProbationPractitioner
}

export type ManagedCase = GenericManagedCase<Licence>
export type ManagedCaseForApproval = GenericManagedCase<ApprovalLicence>
