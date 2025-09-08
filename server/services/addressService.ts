import { User } from '../@types/CvlUserDetails'
import { AddAddressRequest, AddressResponse, AddressSearchResponse } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class AddressService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async searchForAddresses(searchQuery: string, user: User, priorityString?: string): Promise<AddressSearchResponse[]> {
    if (!searchQuery?.trim()) return []

    const requestBody = { searchQuery }

    const results = await this.licenceApiClient.searchForAddresses(requestBody, user)

    if (results.length > 1 && priorityString?.trim()) {
      const lowercasePriority = priorityString.toLowerCase()

      const rankedAddresses = results.map(address => {
        const addressText = [address.firstLine, address.secondLine ?? ''].join(',').toLowerCase()
        const matchPriority = addressText.includes(lowercasePriority) ? 1 : 0
        return { address, matchPriority, addressText }
      })

      rankedAddresses.sort((a, b) => {
        // Sort by priority first
        if (b.matchPriority !== a.matchPriority) {
          return b.matchPriority - a.matchPriority
        }
        // Then alphabetical by address text
        return a.addressText.localeCompare(b.addressText)
      })
      return rankedAddresses.map(ranked => ranked.address)
    }

    return results
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
