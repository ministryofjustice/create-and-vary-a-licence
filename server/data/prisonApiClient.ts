import { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import type { TokenStore } from './tokenStore'
import type { PrisonApiCaseload, PrisonApiUserDetail, PrisonDetail } from '../@types/prisonApiClientTypes'
import { User } from '../@types/CvlUserDetails'

export default class PrisonApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Prison API', config.apis.prisonApi as ApiConfig)
  }

  // Streamed - for embedding in HTML pages
  async getPrisonerImage(nomsId: string, user: User): Promise<Readable> {
    return (await this.stream(
      {
        path: `/api/bookings/offenderNo/${nomsId}/image/data`,
      },
      { username: user.username },
    )) as Promise<Readable>
  }

  // Data - for pulling the base64 JPEG image for an offender to embed in PDFs
  async getPrisonerImageData(nomsId: string, user: User): Promise<Buffer> {
    return (await this.get(
      {
        path: `/api/bookings/offenderNo/${nomsId}/image/data`,
        responseType: 'image/jpeg',
      },
      { username: user.username },
    )) as Promise<Buffer>
  }

  async getPrisons(): Promise<PrisonDetail[]> {
    return (await this.get({ path: `/api/agencies/type/INST?active=true` })) as Promise<PrisonDetail[]>
  }

  async getUser(user: User): Promise<PrisonApiUserDetail> {
    return (await this.get(
      {
        path: '/api/users/me',
      },
      { token: user.token },
    )) as Promise<PrisonApiUserDetail>
  }

  async getUserCaseloads(user: User): Promise<PrisonApiCaseload[]> {
    return (await this.get(
      {
        path: '/api/users/me/caseLoads',
      },
      { token: user.token },
    )) as Promise<PrisonApiCaseload[]>
  }
}
