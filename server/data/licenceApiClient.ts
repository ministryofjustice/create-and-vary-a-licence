import RestClient from './hmppsRestClient'
import type {
  ContactNumberRequest,
  CreateLicenceRequest,
  LicenceSummary,
  Licence,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AppointmentAddressRequest,
  BespokeConditionsRequest,
  StatusUpdateRequest,
  AdditionalConditionsRequest,
  UpdateAdditionalConditionDataRequest,
} from '../@types/licenceApiClientTypes'
import config, { ApiConfig } from '../config'
import LicenceStatus from '../enumeration/licenceStatus'

export default class LicenceApiClient extends RestClient {
  constructor() {
    super('Licence API', config.apis.licenceApi as ApiConfig)
  }

  async createLicence(licence: CreateLicenceRequest, username: string): Promise<LicenceSummary> {
    return (await this.post(
      {
        path: `/licence/create`,
        data: licence,
      },
      username
    )) as Promise<LicenceSummary>
  }

  async getLicenceById(licenceId: string, username: string): Promise<Licence> {
    return (await this.get({ path: `/licence/id/${licenceId}` }, username)) as Promise<Licence>
  }

  async updateAppointmentPerson(
    licenceId: string,
    appointmentPerson: AppointmentPersonRequest,
    username: string
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/appointmentPerson`, data: appointmentPerson }, username)
  }

  async updateAppointmentTime(
    licenceId: string,
    appointmentTime: AppointmentTimeRequest,
    username: string
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/appointmentTime`, data: appointmentTime }, username)
  }

  async updateAppointmentAddress(
    licenceId: string,
    appointmentAddress: AppointmentAddressRequest,
    username: string
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/appointment-address`, data: appointmentAddress }, username)
  }

  async updateContactNumber(licenceId: string, contactNumber: ContactNumberRequest, username: string): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/contact-number`, data: contactNumber }, username)
  }

  async updateBespokeConditions(
    licenceId: string,
    bespokeConditions: BespokeConditionsRequest,
    username: string
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/bespoke-conditions`, data: bespokeConditions }, username)
  }

  async updateAdditionalConditions(
    licenceId: string,
    additionalConditions: AdditionalConditionsRequest,
    username: string
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/additional-conditions`, data: additionalConditions }, username)
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    additionalConditionData: UpdateAdditionalConditionDataRequest,
    username: string
  ): Promise<void> {
    await this.put(
      {
        path: `/licence/id/${licenceId}/additional-conditions/condition/${additionalConditionId}`,
        data: additionalConditionData,
      },
      username
    )
  }

  async updateLicenceStatus(licenceId: string, statusRequest: StatusUpdateRequest, username: string): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/status`, data: statusRequest }, username)
  }

  async getLicencesByStaffIdAndStatus(
    staffId: number,
    statuses: LicenceStatus[],
    username: string
  ): Promise<LicenceSummary[]> {
    return (await this.get(
      { path: `/licence/staffId/${staffId}`, query: { status: statuses } },
      username
    )) as LicenceSummary[]
  }

  async matchLicences(
    statuses: string[] = [],
    prisons: string[] = [],
    staffIds: number[] = [],
    nomisIds: string[] = [],
    sortBy?: string,
    sortOrder?: string,
    username?: string
  ): Promise<LicenceSummary[]> {
    return (await this.get(
      {
        path: `/licence/match`,
        query: {
          prison: prisons,
          status: statuses,
          staffId: staffIds,
          nomisId: nomisIds,
          sortBy: sortBy || undefined,
          sortOrder: sortOrder || undefined,
        },
      },
      username
    )) as LicenceSummary[]
  }

  async batchActivateLicences(licenceIds: number[]): Promise<void> {
    await this.post({ path: `/licence/activate-licences`, data: licenceIds })
  }
}
