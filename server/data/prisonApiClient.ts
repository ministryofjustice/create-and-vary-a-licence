import { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type {
  PrisonApiCaseload,
  PrisonApiPrisoner,
  PrisonApiUserDetail,
  PrisonInformation,
  HomeDetentionCurfew,
} from '../@types/prisonApiClientTypes'

export default class PrisonApiClient extends RestClient {
  constructor() {
    super('Prison API', config.apis.prisonApi as ApiConfig)
  }

  // Streamed - for embedding in HTML pages
  async getPrisonerImage(nomsId: string, username: string): Promise<Readable> {
    return (await this.stream(
      {
        path: `/api/bookings/offenderNo/${nomsId}/image/data`,
      },
      username
    )) as Promise<Readable>
  }

  // Data - for pulling the base64 JPEG image for an offender to embed in PDFs
  async getPrisonerImageData(nomsId: string, username: string): Promise<Buffer> {
    return (await this.get(
      {
        path: `/api/bookings/offenderNo/${nomsId}/image/data`,
        responseType: 'image/jpeg',
      },
      username
    )) as Promise<Buffer>
  }

  async getPrisonerDetail(nomsId: string, username: string): Promise<PrisonApiPrisoner> {
    return (await this.get({ path: `/api/offenders/${nomsId}` }, username)) as Promise<PrisonApiPrisoner>
  }

  async getPrisonInformation(prisonId: string, username: string): Promise<PrisonInformation> {
    return (await this.get({ path: `/api/agencies/prison/${prisonId}` }, username)) as Promise<PrisonInformation>
  }

  // TODO: No longer used - leave as might use in future check
  async getLatestHdcStatus(bookingId: string, username: string): Promise<HomeDetentionCurfew> {
    return (await this.get(
      {
        path: `/api/offender-sentences/booking/${bookingId}/home-detention-curfews/latest`,
      },
      username
    )) as Promise<HomeDetentionCurfew>
  }

  async getLatestHdcStatusBatch(bookingIds: number[], username: string): Promise<HomeDetentionCurfew[]> {
    return (await this.post(
      {
        path: `/api/offender-sentences/home-detention-curfews/latest`,
        data: bookingIds,
      },
      username
    )) as Promise<HomeDetentionCurfew[]>
  }

  async getUser(username: string): Promise<PrisonApiUserDetail> {
    return (await this.get(
      {
        path: '/api/users/me',
      },
      username
    )) as Promise<PrisonApiUserDetail>
  }

  async getUserCaseloads(username: string): Promise<PrisonApiCaseload[]> {
    return (await this.get(
      {
        path: '/api/users/me/caseLoads',
      },
      username
    )) as Promise<PrisonApiCaseload[]>
  }
}
