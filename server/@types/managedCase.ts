import { CommunityApiManagedOffender, CommunityApiTeamManagedCase } from './communityClientTypes'
import { Prisoner } from './prisonerSearchApiClientTypes'
import LicenceStatus from '../enumeration/licenceStatus'
import LicenceType from '../enumeration/licenceType'
import { LicenceSummary } from './licenceApiClientTypes'

export type ManagedCase = CommunityApiManagedOffender & Prisoner & CommunityApiTeamManagedCase
export interface CaseTypeAndStatus extends ManagedCase {
  licenceStatus: LicenceStatus
  licenceType: LicenceType
}
export interface LicenceAndResponsibleCom extends LicenceSummary {
  comFirstName: string
  comLastName: string
}
