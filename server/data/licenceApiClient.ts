import RestClient from './restClient'
import type {
  ContactNumberRequest,
  CreateLicenceRequest,
  CreateLicenceResponse,
  Licence,
  LicenceApiTestData,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
} from './licenceApiClientTypes'
import config, { ApiConfig } from '../config'

export default class LicenceApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Licence API', config.apis.licenceApi as ApiConfig, token)
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

  async updateAppointmentTime(licenceId: string, appointmentTime: AppointmentTimeRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/appointmentTime`, data: appointmentTime })
  }

  async updateContactNumber(licenceId: string, contactNumber: ContactNumberRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/contact-number`, data: contactNumber })
  }
}
