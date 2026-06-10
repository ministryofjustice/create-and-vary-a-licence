import { User } from '../../@types/CvlUserDetails'
import { AddHdcCurfewAddressRequest } from '../../@types/licenceApiClientTypes'
import { LicenceApiClient } from '../../data'

export default class HdcCurfewAddressService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async updateHdcCurfewAddress(licenceId: number, request: AddHdcCurfewAddressRequest, user: User): Promise<void> {
    return this.licenceApiClient.updateHdcCurfewAddress(licenceId, request, user)
  }
}
