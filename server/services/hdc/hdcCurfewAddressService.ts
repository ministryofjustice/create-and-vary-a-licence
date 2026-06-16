import { User } from '../../@types/CvlUserDetails'
import { AddHdcCurfewAddressRequest, Licence } from '../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../data'
import { assertIsHdcLicence } from '../../utils/utils'

export default class HdcCurfewAddressService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async updateHdcCurfewAddress(licenceId: number, request: AddHdcCurfewAddressRequest, user: User): Promise<void> {
    return this.licenceApiClient.updateHdcCurfewAddress(licenceId, request, user)
  }

  async updateResidentialChecks(licence: Licence, completed: boolean, reason: string, user: User) {
    assertIsHdcLicence(licence)
    const request: AddHdcCurfewAddressRequest = {
      accommodationType: licence.curfewAddress?.accommodationType,
      postReleaseResidentialChecksCompleted: completed,
      postReleaseResidentialChecksNotCompletedReason: reason,
    }

    return this.updateHdcCurfewAddress(Number(licence.id), request, user)
  }
}
