import config, { ApiConfig } from '../config'
import RestClient from './restClient'

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

  async getUser(username: string): Promise<AuthUserDetails> {
    return (await this.get({ path: '/api/user/me' }, username)) as Promise<AuthUserDetails>
  }

  async getUserEmail(username: string): Promise<AuthUserEmail> {
    return (await this.get({ path: '/api/me/email' }, username)) as Promise<AuthUserEmail>
  }

  async getUserRoles(username: string): Promise<string[]> {
    return this.get({ path: '/api/user/me/roles' }, username).then(roles =>
      (<AuthUserRole[]>roles).map(role => role.roleCode)
    ) as Promise<string[]>
  }
}
