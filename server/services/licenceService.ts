import type HmppsAuthClient from '../data/hmppsAuthClient'
import { TestData } from '../data/licenceClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class LicenceService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getTestData(username: string): Promise<TestData[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getTestData()
  }
}
