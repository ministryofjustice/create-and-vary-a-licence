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
  SubmitLicenceRequest,
} from '../@types/licenceApiClientTypes'
import config, { ApiConfig } from '../config'
import { User } from '../@types/CvlUserDetails'

export default class LicenceApiClient extends RestClient {
  constructor() {
    super('Licence API', config.apis.licenceApi as ApiConfig)
  }

  async createLicence(licence: CreateLicenceRequest, user: User): Promise<LicenceSummary> {
    return (await this.post(
      {
        path: `/licence/create`,
        data: licence,
      },
      { username: user.username }
    )) as Promise<LicenceSummary>
  }

  async getLicenceById(licenceId: string, user: User): Promise<Licence> {
    return (await this.get({ path: `/licence/id/${licenceId}` }, { username: user.username })) as Promise<Licence>
  }

  async updateAppointmentPerson(
    licenceId: string,
    appointmentPerson: AppointmentPersonRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointmentPerson`, data: appointmentPerson },
      { username: user.username }
    )
  }

  async updateAppointmentTime(licenceId: string, appointmentTime: AppointmentTimeRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointmentTime`, data: appointmentTime },
      { username: user.username }
    )
  }

  async updateAppointmentAddress(
    licenceId: string,
    appointmentAddress: AppointmentAddressRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/appointment-address`, data: appointmentAddress },
      { username: user.username }
    )
  }

  async updateContactNumber(licenceId: string, contactNumber: ContactNumberRequest, user: User): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/contact-number`, data: contactNumber },
      { username: user.username }
    )
  }

  async updateBespokeConditions(
    licenceId: string,
    bespokeConditions: BespokeConditionsRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/bespoke-conditions`, data: bespokeConditions },
      { username: user.username }
    )
  }

  async updateAdditionalConditions(
    licenceId: string,
    additionalConditions: AdditionalConditionsRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/additional-conditions`, data: additionalConditions },
      { username: user.username }
    )
  }

  async updateAdditionalConditionData(
    licenceId: string,
    additionalConditionId: string,
    additionalConditionData: UpdateAdditionalConditionDataRequest,
    user: User
  ): Promise<void> {
    await this.put(
      {
        path: `/licence/id/${licenceId}/additional-conditions/condition/${additionalConditionId}`,
        data: additionalConditionData,
      },
      { username: user.username }
    )
  }

  async updateLicenceStatus(licenceId: string, statusRequest: StatusUpdateRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/status`, data: statusRequest }, { username: user.username })
  }

  async submitLicence(licenceId: string, request: SubmitLicenceRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/submit`, data: request }, { username: user.username })
  }

  async matchLicences(
    statuses: string[] = [],
    prisons: string[] = [],
    staffIds: number[] = [],
    nomisIds: string[] = [],
    sortBy?: string,
    sortOrder?: string,
    user?: User
  ): Promise<LicenceSummary[]> {
    return (await this.get(
      {
        path: `/licence/match`,
        query: {
          prison: prisons,
          status: statuses,
          staffId: staffIds,
          nomsId: nomisIds,
          sortBy: sortBy || undefined,
          sortOrder: sortOrder || undefined,
        },
      },
      { username: user?.username }
    )) as LicenceSummary[]
  }

  async batchActivateLicences(licenceIds: number[]): Promise<void> {
    await this.post({ path: `/licence/activate-licences`, data: licenceIds })
  }

  async uploadConditionFile(
    licenceId: string,
    conditionId: string,
    user: User,
    file: Express.Multer.File
  ): Promise<void> {
    return (await this.postMultiPart(
      {
        path: `/licence/id/${licenceId}/condition/id/${conditionId}/upload-file`,
        fileToUpload: file,
      },
      { username: user?.username }
    )) as void
  }
}
