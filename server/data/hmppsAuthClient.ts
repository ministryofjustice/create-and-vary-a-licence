import superagent from 'superagent'
import querystring from 'querystring'
import type TokenStore from './tokenStore'
import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import RestClient from './restClient'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

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

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret
  )

  const authRequest = username
    ? querystring.stringify({ grant_type: 'client_credentials', username })
    : querystring.stringify({ grant_type: 'client_credentials' })

  logger.info(
    `HMPPS Auth request '${authRequest}' for client id '${config.apis.hmppsAuth.systemClientId}' and user '${username}'`
  )

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(authRequest)
    .timeout(timeoutSpec)
}

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  public restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  async getUser(token: string): Promise<AuthUserDetails> {
    return this.restClient(token).get({ path: '/api/user/me' }) as Promise<AuthUserDetails>
  }

  async getUserEmail(token: string): Promise<AuthUserEmail> {
    return this.restClient(token).get({ path: '/api/me/email' }) as Promise<AuthUserEmail>
  }

  async getUserRoles(token: string): Promise<string[]> {
    return this.restClient(token)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<AuthUserRole[]>roles).map(role => role.roleCode)) as Promise<string[]>
  }

  async getSystemClientToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'
    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }
    const newToken = await getSystemClientTokenFromHmppsAuth(username)
    // Set the TTL slightly less than expiry of token
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)
    return newToken.body.access_token
  }
}
