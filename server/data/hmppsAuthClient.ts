import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { User } from '../@types/CvlUserDetails'

export type AuthUserDetails = {
  name: string
  activeCaseLoadId: string
}

export type AuthUserEmail = {
  username: string
  email?: string
  verified: boolean
}

export type AuthUserRole = {
  roleCode: string
}

export default class HmppsAuthClient extends RestClient {
  constructor() {
    super('HMPPS Auth Client', config.apis.hmppsAuth as ApiConfig)
  }

  async getUser(user: User): Promise<AuthUserDetails> {
    return (await this.get({ path: '/api/user/me' }, { token: user.token })) as Promise<AuthUserDetails>
  }

  async getUserEmail(user: User): Promise<AuthUserEmail> {
    return (await this.get({ path: '/api/me/email' }, { token: user.token })) as Promise<AuthUserEmail>
  }
}
