import LicenceStatus from '../../server/enumeration/licenceStatus'

export type GetLicenceArgs = {
  licenceId: string
  licenceStatus: LicenceStatus
}
