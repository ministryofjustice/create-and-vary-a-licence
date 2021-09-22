import RestClient from './restClient'
import type {
  CreateLicenceRequest,
  CreateLicenceResponse,
  Licence,
  LicenceApiTestData,
  AppointmentPersonRequest,
} from './licenceApiClientTypes'
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

  async getLicenceById(licenceId: string): Promise<Licence> {
    return (await this.restClient.get({ path: `/licence/id/${licenceId}` })) as Promise<Licence>
  }

  async updateAppointmentPerson(licenceId: string, appointmentPerson: AppointmentPersonRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/appointmentPerson`, data: appointmentPerson })
  }
}
