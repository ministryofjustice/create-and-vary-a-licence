import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { User } from '../@types/CvlUserDetails'
import { TokenStore } from './tokenStore'

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
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'HMPPS Auth Client', config.apis.manageUsersApi as ApiConfig)
  }

  async getUser(user: User): Promise<AuthUserDetails> {
    return (await this.get({ path: '/users/me' }, { token: user.token })) as Promise<AuthUserDetails>
  }

  async getUserEmail(user: User): Promise<AuthUserEmail> {
    return (await this.get({ path: '/users/me/email' }, { token: user.token })) as Promise<AuthUserEmail>
  }
}
