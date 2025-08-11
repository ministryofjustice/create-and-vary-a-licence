import { User } from '../@types/CvlUserDetails'
import { AddAddressRequest, AddressResponse, AddressSearchResponse } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class AddressService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async searchForAddresses(searchQuery: string, user: User): Promise<AddressSearchResponse[]> {
    if (!searchQuery || searchQuery.trim().length === 0) {
      return []
    }
    const requestBody = { searchQuery } as { searchQuery: string }
    return this.licenceApiClient.searchForAddresses(requestBody, user)
  }

  async addAppointmentAddress(licenceId: string, appointmentAddress: AddAddressRequest, user: User): Promise<void> {
    return this.licenceApiClient.addAppointmentAddress(licenceId, appointmentAddress, user)
  }

  async getPreferredAddresses(user: User): Promise<AddressResponse[]> {
    return this.licenceApiClient.getPreferredAddresses(user)
  }

  async deleteAddressByReference(reference: string, user: User): Promise<void> {
    return this.licenceApiClient.deleteAddressByReference(reference, user)
  }
}
