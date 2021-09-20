import RestClient from './restClient'
import type { CreateLicenceRequest, CreateLicenceResponse, LicenceApiTestData } from './licenceApiClientTypes'
import config, { ApiConfig } from '../config'

export default class LicenceApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.licenceApi as ApiConfig, token)
  }

  async getTestData(): Promise<LicenceApiTestData[]> {
    return (await this.restClient.get({ path: `/test/data` })) as Promise<LicenceApiTestData[]>
  }

  async createLicence(licence: CreateLicenceRequest): Promise<CreateLicenceResponse> {
    return (await this.restClient.post({
      path: `/licence/create`,
      data: licence,
    })) as Promise<CreateLicenceResponse>
  }
}
