import { definitions } from './communityApiImport'

export type CommunityApiManagedOffender = definitions['ManagedOffender']
export type CommunityApiStaffDetails = definitions['StaffDetails']

// TODO: Return the correct type imported from Community-API when the teams/managaedOffenders endpoint is in.
//  At the moment, delius-wiremock returns a subset of CommunityApiManagedOffender
export type CommunityApiTeamManagedCase = definitions['TeamManagedCase']
