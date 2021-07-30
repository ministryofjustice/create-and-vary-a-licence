import RestClient from './restClient'
import type { LicenceApiTestData } from './licenceClientTypes'
import config, { ApiConfig } from '../config'

export default class LicenceApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.licenceApi as ApiConfig, token)
  }

  async getTestData(): Promise<LicenceApiTestData[]> {
    return this.restClient.get({ path: `/test/data` }) as Promise<LicenceApiTestData[]>
  }
}
