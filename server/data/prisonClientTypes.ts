type Alert = {
  alertType: string
  alertCode: string
  alertTypeDescription: string
  active: boolean
}

export interface PrisonerDetail {
  offenderNo: string
  title: string
  suffix: string
  firstName: string
  middleNames: string
  lastName: string
  dateOfBirth: string
  gender: string
  sexCode?: 'M' | 'F'
  nationalities: string
  currentlyInPrison?: 'Y' | 'N'
  latestBookingId: number
  latestLocationId: string
  latestLocation: string
  internalLocation: string
  pncNumber: string
  croNumber: string
  ethnicity: string
  ethnicityCode: string
  birthCountry: string
  religion: string
  religionCode: string
  convictedStatus: string
  bandCode: string
  imprisonmentStatus: string
  imprisonmentStatusDesc: string
  receptionDate?: string // ISO-8601 date format
  maritalStatus: string
  alerts: Alert[]
}

export interface PrisonUser {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
}
