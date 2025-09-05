import { User } from '../@types/CvlUserDetails'
import { AddAddressRequest, AddressResponse, AddressSearchResponse } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class AddressService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async searchForAddresses(
    searchQuery: string,
    user: User,
    priorityStrings: string[] = [],
  ): Promise<AddressSearchResponse[]> {
    if (!searchQuery?.trim()) return []

    const requestBody = { searchQuery }
    const results = await this.licenceApiClient.searchForAddresses(requestBody, user)
    if (results.length > 1 && priorityStrings.length > 0) {
      const addressSortingInfo = this.generateAddressSortingInfo(results, priorityStrings)

      addressSortingInfo.sort(
        (a, b) =>
          b.matchCount - a.matchCount ||
          this.compareAddressPrioritySequences(a.prioritySequence, b.prioritySequence) ||
          a.originalIndex - b.originalIndex,
      )

      return addressSortingInfo.map(item => item.address)
    }
    return results
  }

  private generateAddressSortingInfo(results: AddressSearchResponse[], priorityStrings: string[]) {
    const lowercasePriorities = priorityStrings.map(p => p.toLowerCase())

    return results.map((address, index) => this.rankAddressForSorting(address, index, lowercasePriorities))
  }

  private rankAddressForSorting(address: AddressSearchResponse, index: number, priorities: string[]) {
    const addressText = [address.firstLine, address.secondLine ?? ''].join(',').toLowerCase()

    const matchedPriorities = priorities
      .map((priority, priorityIdx) => ({
        priorityIdx,
        pos: addressText.indexOf(priority),
      }))
      .filter(match => match.pos !== -1)
      .sort((a, b) => a.pos - b.pos)

    const prioritySequence = [...new Set(matchedPriorities.map(m => m.priorityIdx))]

    return {
      address,
      matchCount: prioritySequence.length,
      prioritySequence,
      originalIndex: index,
    }
  }

  private compareAddressPrioritySequences(a: number[], b: number[]): number {
    const loopLength = Math.min(a.length, b.length)
    let index = 0
    while (index < loopLength) {
      if (a[index] !== b[index]) return a[index] - b[index]
      index += 1
    }
    return a.length - b.length
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
