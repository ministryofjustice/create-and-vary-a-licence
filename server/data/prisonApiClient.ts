import { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type {
  PrisonApiCaseload,
  PrisonApiPrisoner,
  PrisonApiUserDetail,
  PrisonInformation,
} from '../@types/prisonApiClientTypes'

export default class PrisonApiClient {
  restClient: RestClient

  constructor(token = '') {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi as ApiConfig, token)
  }

  // Streamed - for embedding in HTML pages
  async getPrisonerImage(nomsId: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${nomsId}/image/data`,
    }) as Promise<Readable>
  }

  // Data - for pulling the base64 JPEG image for an offender to embed in PDFs
  async getPrisonerImageData(nomsId: string): Promise<Buffer> {
    return this.restClient.get({
      path: `/api/bookings/offenderNo/${nomsId}/image/data`,
      responseType: 'image/jpeg',
    }) as Promise<Buffer>
  }

  async getPrisonerDetail(nomsId: string): Promise<PrisonApiPrisoner> {
    return this.restClient.get({ path: `/api/offenders/${nomsId}` }) as Promise<PrisonApiPrisoner>
  }

  async getPrisonInformation(prisonId: string): Promise<PrisonInformation> {
    return this.restClient.get({ path: `/api/agencies/prison/${prisonId}` }) as Promise<PrisonInformation>
  }

  // Called with the user's own token
  async getUser(userToken: string): Promise<PrisonApiUserDetail> {
    return this.restClient.getWithUserToken({
      userToken,
      path: '/api/users/me',
    }) as Promise<PrisonApiUserDetail>
  }

  // Called with the user's own token
  async getUserCaseloads(userToken: string): Promise<PrisonApiCaseload[]> {
    return this.restClient.getWithUserToken({
      userToken,
      path: '/api/users/me/caseLoads',
    }) as Promise<PrisonApiCaseload[]>
  }
}
