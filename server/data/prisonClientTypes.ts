export type Alert = {
  alertType: string
  alertTypeDescription: string
  alertCode: string
  alertCodeDescription: string
  active: boolean
  dateCreated: string
  dateExpired: string
}

export type Identifiers = {
  type: string
  value: string
}

export type SentenceDetail = {
  sentenceStartDate: string
  additionalDaysAwarded: number
  tariffDate: string
  releaseDate: string
  conditionalReleaseDate: string
  confirmedReleaseDate: string
  sentenceExpiryDate: string
  licenceExpiryDate: string
  homeDetentionCurfewEligibilityDate: string
}

export interface PrisonerDetail {
  offenderNo: string
  firstName: string
  lastName: string
  dateOfBirth: string
  age: number
  activeFlag: boolean
  activeAlertCount: number
  legalStatus: string
  latestLocationId: string
  locationDescription: string
  status: string
  bookingId: number
  bookingNo: string
  category: string
  imprisonmentStatus: string
  imprisonmentStatusDescription: string
  religion: string
  alerts: Alert[]
  identifiers: Identifiers[]
  sentenceDetail: SentenceDetail
}

export interface PrisonUser {
  userId: string
  username: string
  email: string
  firstName: string
  lastName: string
}
