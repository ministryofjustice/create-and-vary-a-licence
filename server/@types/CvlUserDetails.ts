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

  // Delius telephone number
  telephoneNumber?: string

  // Probation staffIdentifier in nDelius e.g. 120003434
  deliusStaffIdentifier?: number

  // Probation staffCode in nDelius e.g. X345H
  deliusStaffCode?: string

  // Probation team codes that this user is a member of
  probationTeams?: string[]

  // probation area code
  probationArea?: string

  // Probation area description
  probationAreaDescription?: string

  // Email address - from Nomis, Delius or Auth depending on source
  emailAddress?: string

  // LDU code(s)
  probationLduCodes?: string[]

  // PDU code(s)
  probationPduCodes?: string[]
}

export type User = Express.User & CvlUserDetails
