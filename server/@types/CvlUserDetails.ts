export class CvlUserDetails {
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

  // True if user has more than one caseload in Nomis
  hasMultipleCaseloadsInNomis?: boolean

  // True if user has selected more than one caseload to view
  hasSelectedMultiplePrisonCaseloads?: boolean

  // Caseloads to display - either selected by user or activeCaseload if none selected
  prisonCaseloadToDisplay?: string[] = []

  // Prison staff id in Nomis
  nomisStaffId?: number

  // Probation staffIdentifier in nDelius e.g. 120003434
  deliusStaffIdentifier?: number

  // Probation staffCode in nDelius e.g. X345H
  deliusStaffCode?: string

  // Is this user a probation user
  isProbationUser?: boolean

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

  // User ID - staffId from Nomis, uuid from Auth, null for delius, depending on source
  reportUserId?: string
}

export type User = Express.LocalsUser
