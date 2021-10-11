import RestClient from './restClient'
import type {
  ContactNumberRequest,
  CreateLicenceRequest,
  LicenceSummary,
  Licence,
  LicenceApiTestData,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AppointmentAddressRequest,
  BespokeConditionsRequest,
  StatusUpdateRequest,
} from '../@types/licenceApiClientTypes'
import config, { ApiConfig } from '../config'
import LicenceStatus from '../enumeration/licenceStatus'

export default class LicenceApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Licence API', config.apis.licenceApi as ApiConfig, token)
  }

  async getTestData(): Promise<LicenceApiTestData[]> {
    return (await this.restClient.get({ path: `/test/data` })) as Promise<LicenceApiTestData[]>
  }

  async createLicence(licence: CreateLicenceRequest): Promise<LicenceSummary> {
    return (await this.restClient.post({
      path: `/licence/create`,
      data: licence,
    })) as Promise<LicenceSummary>
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

  async updateAppointmentAddress(licenceId: string, appointmentAddress: AppointmentAddressRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/appointment-address`, data: appointmentAddress })
  }

  async updateContactNumber(licenceId: string, contactNumber: ContactNumberRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/contact-number`, data: contactNumber })
  }

  async updateBespokeConditions(licenceId: string, bespokeConditions: BespokeConditionsRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/bespoke-conditions`, data: bespokeConditions })
  }

  async updateLicenceStatus(licenceId: string, statusRequest: StatusUpdateRequest): Promise<void> {
    await this.restClient.put({ path: `/licence/id/${licenceId}/status`, data: statusRequest })
  }

  async getLicencesByStaffIdAndStatus(staffId: number, statuses: LicenceStatus[]): Promise<LicenceSummary[]> {
    const queryParameters: string[] = []
    statuses.forEach(status => {
      queryParameters.push(`status=${status}`)
    })
    return (await this.restClient.get({
      path: `/licence/staffId/${staffId}${queryParameters.length > 0 ? `?${queryParameters.join('&')}` : ''}`,
    })) as LicenceSummary[]
  }

  async getLicencesForApproval(prisonCaseload: string[]): Promise<LicenceSummary[]> {
    const queryParameters: string[] = []
    prisonCaseload.forEach(prison => {
      queryParameters.push(`prison=${prison}`)
    })
    return (await this.restClient.get({
      path: `/licence/approval-candidates${queryParameters.length > 0 ? `?${queryParameters.join('&')}` : ''}`,
    })) as LicenceSummary[]
  }
}
