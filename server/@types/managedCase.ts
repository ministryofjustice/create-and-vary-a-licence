import { CommunityApiManagedOffender } from './communityClientTypes'
import { Prisoner } from './prisonerSearchApiClientTypes'

export type ManagedCase = CommunityApiManagedOffender & Prisoner
