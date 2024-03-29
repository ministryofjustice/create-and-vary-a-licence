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
  submittedByFullName?: string
}

export type ManagedCase = {
  deliusRecord?: DeliusRecord
  nomisRecord?: Prisoner
  licences?: Licence[]
  probationPractitioner?: ProbationPractitioner
}
