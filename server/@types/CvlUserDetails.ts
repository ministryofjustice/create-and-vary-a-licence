export default class CvlUserDetails {
  // e.g. john
  firstName?: string

  // e.g. smith
  lastName?: string

  // e.g. John Smith
  displayName?: string

  // e.g. MDI
  activeCaseload?: string

  // e.g. ['LEI', 'MDI']
  prisonCaseload?: string[] = []

  // Prison staff id in Nomis
  nomisStaffId?: number

  // Probation staffIdentifier in nDelius e.g. 120003434
  deliusStaffIdentifier?: number

  // Probation staffCode in nDelius e.g. X345H
  deliusStaffCode?: string

  // Probation area code
  probationAreaCode?: string

  // Probation area description
  probationAreaDescription?: string

  // PDU code(s)
  probationPduCodes?: string[]

  // LAU code(s)
  probationLauCodes?: string[]

  // Probation team codes
  probationTeamCodes?: string[]

  // List of probation teams assigned to a Delius user
  probationTeams?: { code: string; label: string }[]

  // Email address - from Nomis, Delius or Auth depending on source
  emailAddress?: string
}

export type User = Express.LocalsUser
