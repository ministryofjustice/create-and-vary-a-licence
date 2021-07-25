export type Staff = {
  forenames: string
  surname: string
}

export type CodeDescription = {
  code: string
  description: string
}

export type Team = {
  borough: CodeDescription
  code: string
  description: string
  district: CodeDescription
  emailAddress: string
  endDate: Date
  localDeliveryUnit: CodeDescription
  startDate: Date
  teamType: CodeDescription
  telephone: string
}

export interface StaffDetail {
  staff: Staff
  staffCode: string
  staffIdentifier: number
  teams: Team[]
  email: string
  telephoneNumber: string
  username: string
}

export interface ManagedOffender {
  crnNumber: string
  currentOm: boolean
  currentPom: boolean
  currentRo: boolean
  nomsNumber: string
  offenderId: number
  offenderSurname: string
  omEndDate: string
  omStartDate: string
  staffCode: string
  staffIdentifier: number
}
