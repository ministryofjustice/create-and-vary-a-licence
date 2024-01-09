import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { User } from '../@types/CvlUserDetails'
import { TokenStore } from './tokenStore'

export type PrisonUserDetails = {
  name: string
  activeCaseLoadId: string
}

export type PrisonUserEmail = {
  username: string
  email?: string
  verified: boolean
}

export default class ManageUsersApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Manage users API', config.apis.manageUsersApi as ApiConfig)
  }

  async getUser(user: User): Promise<PrisonUserDetails> {
    return (await this.get({ path: '/users/me' }, { token: user.token })) as Promise<PrisonUserDetails>
  }

  async getUserEmail(user: User): Promise<PrisonUserEmail> {
    return (await this.get({ path: '/users/me/email' }, { token: user.token })) as Promise<PrisonUserEmail>
  }
}
