import type HmppsAuthClient from '../data/hmppsAuthClient'
import { LicenceApiTestData } from '../data/licenceClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class LicenceService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getTestData(username: string): Promise<LicenceApiTestData[]> {
    const token = await this.hmppsAuthClient.getSystemClientToken(username)
    return new LicenceApiClient(token).getTestData()
  }
}
