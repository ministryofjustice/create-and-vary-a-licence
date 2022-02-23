import { Readable } from 'stream'
import RestClient from './hmppsRestClient'
import type {
  ContactNumberRequest,
  CreateLicenceRequest,
  LicenceSummary,
  Licence,
  AppointmentPersonRequest,
  AppointmentTimeRequest,
  AppointmentAddressRequest,
  AuditEvent,
  AuditRequest,
  BespokeConditionsRequest,
  StatusUpdateRequest,
  AdditionalConditionsRequest,
  UpdateAdditionalConditionDataRequest,
  UpdateSpoDiscussionRequest,
  UpdateVloDiscussionRequest,
  UpdateReasonForVariationRequest,
  UpdatePrisonInformationRequest,
  UpdateSentenceDatesRequest,
} from '../@types/licenceApiClientTypes'
import config, { ApiConfig } from '../config'
import { User } from '../@types/CvlUserDetails'
import { UpdateComRequest } from '../@types/licenceApiClientTypes'

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

  async updateLicenceStatus(licenceId: string, statusRequest: StatusUpdateRequest, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/status`, data: statusRequest }, { username: user?.username })
  }

  async submitLicence(licenceId: string, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/submit` }, { username: user.username })
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

  async uploadExclusionZoneFile(
    licenceId: string,
    conditionId: string,
    user: User,
    file: Express.Multer.File
  ): Promise<void> {
    return (await this.postMultiPart(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/file-upload`,
        fileToUpload: file,
      },
      { username: user?.username }
    )) as void
  }

  async removeExclusionZoneFile(licenceId: string, conditionId: string, user: User): Promise<void> {
    return (await this.put(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/remove-upload`,
      },
      { username: user?.username }
    )) as void
  }

  // A readable stream for embedding directly in HTML templates
  async getExclusionZoneImage(licenceId: string, conditionId: string, user: User): Promise<Readable> {
    return (await this.stream(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/full-size-image`,
      },
      { username: user?.username }
    )) as Promise<Readable>
  }

  // Raw image data to pass to Gotenberg to render in PDF documents
  async getExclusionZoneImageData(licenceId: string, conditionId: string, user: User): Promise<Buffer> {
    return (await this.get(
      {
        path: `/exclusion-zone/id/${licenceId}/condition/id/${conditionId}/full-size-image`,
        responseType: 'image/jpeg',
      },
      { username: user?.username }
    )) as Promise<Buffer>
  }

  async updateResponsibleCom(crn: string, updateResponsibleComRequest: UpdateComRequest): Promise<void> {
    await this.put({ path: `/offender/crn/${crn}/responsible-com`, data: updateResponsibleComRequest })
  }

  async updateComDetails(updateComRequest: UpdateComRequest): Promise<void> {
    await this.put({ path: `/com/update`, data: updateComRequest })
  }

  async createVariation(licenceId: string, user: User): Promise<LicenceSummary> {
    return (await this.post(
      { path: `/licence/id/${licenceId}/create-variation` },
      { username: user?.username }
    )) as Promise<LicenceSummary>
  }

  async updateSpoDiscussion(licenceId: string, request: UpdateSpoDiscussionRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/spo-discussion`, data: request }, { username: user?.username })
  }

  async updateVloDiscussion(licenceId: string, request: UpdateVloDiscussionRequest, user: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/vlo-discussion`, data: request }, { username: user?.username })
  }

  async updateReasonForVariation(
    licenceId: string,
    request: UpdateReasonForVariationRequest,
    user: User
  ): Promise<void> {
    await this.put(
      { path: `/licence/id/${licenceId}/reason-for-variation`, data: request },
      { username: user?.username }
    )
  }

  async discard(licenceId: string, user: User): Promise<void> {
    await this.delete({ path: `/licence/id/${licenceId}/discard` }, { username: user?.username })
  }

  async recordAuditEvent(auditEvent: AuditEvent, user?: User): Promise<void> {
    await this.put({ path: `/audit/save`, data: auditEvent }, { username: user?.username })
  }

  async getAuditEvents(auditRequest: AuditRequest, user?: User): Promise<AuditEvent[]> {
    return (await this.post(
      {
        path: '/audit/retrieve',
        data: auditRequest,
      },
      { username: user?.username }
    )) as Promise<AuditEvent[]>
  }

  async updatePrisonInformation(
    licenceId: string,
    request: UpdatePrisonInformationRequest,
    user?: User
  ): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/prison-information`, data: request }, { username: user?.username })
  }

  async updateSentenceDates(licenceId: string, request: UpdateSentenceDatesRequest, user?: User): Promise<void> {
    await this.put({ path: `/licence/id/${licenceId}/sentence-dates`, data: request }, { username: user?.username })
  }
}
