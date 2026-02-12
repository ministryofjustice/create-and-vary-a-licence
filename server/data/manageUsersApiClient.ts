import config, { ApiConfig } from '../config'
import RestClient from './hmppsRestClient'
import { User } from '../@types/CvlUserDetails'
import { TokenStore } from './tokenStore'

export type UserDetails = {
  name: string
  userId: string
}

export type UserEmail = {
  username: string
  email?: string
  verified: boolean
}

export default class ManageUsersApiClient extends RestClient {
  constructor(tokenStore: TokenStore) {
    super(tokenStore, 'Manage users API', config.apis.manageUsersApi as ApiConfig)
  }

  async getUser(user: User): Promise<UserDetails> {
    return (await this.get({ path: '/users/me' }, { token: user.token })) as Promise<UserDetails>
  }

  async getUserEmail(user: User): Promise<UserEmail> {
    return (await this.get({ path: '/users/me/email' }, { token: user.token })) as Promise<UserEmail>
  }
}
