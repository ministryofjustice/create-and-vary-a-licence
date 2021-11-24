import { CommunityApiManagedOffender } from './communityClientTypes'
import { Prisoner } from './prisonerSearchApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'

export type ManagedCase = CommunityApiManagedOffender & Prisoner
export interface CaseTypeAndStatus extends ManagedCase {
  licenceStatus: LicenceStatus
  licenceType: LicenceType
}
