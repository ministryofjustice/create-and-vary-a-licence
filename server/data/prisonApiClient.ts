import { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import type { TokenStore } from './tokenStore'
import type {
  PrisonApiCaseload,
  PrisonApiPrisoner,
  PrisonApiUserDetail,
  PrisonInformation,
  HomeDetentionCurfew,
  PrisonDetail,
} from '../@types/prisonApiClientTypes'
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
      { username: user.username }
    )) as Promise<Readable>
  }

  // Data - for pulling the base64 JPEG image for an offender to embed in PDFs
  async getPrisonerImageData(nomsId: string, user: User): Promise<Buffer> {
    return (await this.get(
      {
        path: `/api/bookings/offenderNo/${nomsId}/image/data`,
        responseType: 'image/jpeg',
      },
      { username: user.username }
    )) as Promise<Buffer>
  }

  async getPrisonerDetail(nomsId: string, user?: User): Promise<PrisonApiPrisoner> {
    return (await this.get(
      { path: `/api/offenders/${nomsId}` },
      { username: user?.username }
    )) as Promise<PrisonApiPrisoner>
  }

  async getPrisonInformation(prisonId: string, user?: User): Promise<PrisonInformation> {
    return (await this.get(
      { path: `/api/agencies/prison/${prisonId}` },
      { username: user?.username }
    )) as Promise<PrisonInformation>
  }

  async getPrisons(): Promise<PrisonDetail[]> {
    return (await this.get({ path: `/api/agencies/type/INST?active=true` })) as Promise<PrisonDetail[]>
  }

  async getLatestHdcStatus(bookingId: string, user?: User): Promise<HomeDetentionCurfew> {
    return (await this.get(
      {
        path: `/api/offender-sentences/booking/${bookingId}/home-detention-curfews/latest`,
      },
      { username: user?.username }
    )) as Promise<HomeDetentionCurfew>
  }

  async getLatestHdcStatusBatch(bookingIds: number[], user?: User): Promise<HomeDetentionCurfew[]> {
    return (await this.post(
      {
        path: `/api/offender-sentences/home-detention-curfews/latest`,
        data: bookingIds,
      },
      { username: user?.username }
    )) as Promise<HomeDetentionCurfew[]>
  }

  async getUser(user: User): Promise<PrisonApiUserDetail> {
    return (await this.get(
      {
        path: '/api/users/me',
      },
      { token: user.token }
    )) as Promise<PrisonApiUserDetail>
  }

  async getUserCaseloads(user: User): Promise<PrisonApiCaseload[]> {
    return (await this.get(
      {
        path: '/api/users/me/caseLoads',
      },
      { token: user.token }
    )) as Promise<PrisonApiCaseload[]>
  }
}
