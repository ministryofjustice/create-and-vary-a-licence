import { type DeliusRecord } from './deliusClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import LicenceKind from '../enumeration/LicenceKind'
import type { CvlFields, CvlPrisoner } from './licenceApiClientTypes'

export type ProbationPractitioner = {
  staffCode?: string
  staffIdentifier?: number
  name?: string
  staffUsername?: string
}

export type Licence = {
  id?: number
  status: LicenceStatus
  kind?: LicenceKind
  type: LicenceType
  crn?: string
  nomisId?: string
  name?: string
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

export type ManagedCase = {
  deliusRecord?: DeliusRecord
  nomisRecord?: CvlPrisoner
  licences?: Licence[]
  probationPractitioner?: ProbationPractitioner
  cvlFields: CvlFields
}
