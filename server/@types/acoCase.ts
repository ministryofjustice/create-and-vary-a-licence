import LicenceType from '../enumeration/licenceType'

export type AcoCaseView = {
  licenceId?: number
  name: string
  crnNumber: string
  licenceType: LicenceType
  variationRequestDate: string
  releaseDate: string
  probationPractitioner: string
}
