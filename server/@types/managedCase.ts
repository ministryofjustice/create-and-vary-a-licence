import { Prisoner } from './prisonerSearchApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { LicenceSummary } from './licenceApiClientTypes'
import { OffenderDetail } from './probationSearchApiClientTypes'
import { CommunityApiManagedOffender } from './communityClientTypes'

export type DeliusRecord = OffenderDetail & CommunityApiManagedOffender

export type ManagedCase = {
  deliusRecord: DeliusRecord
  nomisRecord: Prisoner
}

export interface CaseTypeAndStatus extends ManagedCase {
  licenceStatus: LicenceStatus
  licenceType: LicenceType
}

export interface LicenceAndResponsibleCom extends LicenceSummary {
  comFirstName: string
  comLastName: string
}
