import { Readable } from 'stream'
import config, { ApiConfig } from '../config'
import RestClient from './restClient'
import type { PrisonerDetail, PrisonUser } from './prisonClientTypes'

export default class PrisonApiClient {
  restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Prison API', config.apis.prisonApi as ApiConfig, token)
  }

  async getPrisonerImage(nomsId: string): Promise<Readable> {
    return this.restClient.stream({
      path: `/api/bookings/offenderNo/${nomsId}/image/data`,
    }) as Promise<Readable>
  }

  async getPrisonerDetail(nomsId: string): Promise<PrisonerDetail> {
    return this.restClient.get({ path: `/api/offenders/${nomsId}` }) as Promise<PrisonerDetail>
  }

  async getPrisonUser(targetUsername: string): Promise<PrisonUser> {
    return this.restClient.get({ path: `/api/users/${targetUsername}` }) as Promise<PrisonUser>
  }
}
