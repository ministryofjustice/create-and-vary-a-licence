import querystring from 'querystring'
import superagent from 'superagent'
import type { RedisClient } from './redisClient'

import logger from '../../logger'
import generateOauthClientToken from '../authentication/clientCredentials'
import config from '../config'

export default class TokenStore {
  private readonly prefix = 'systemToken:'

  constructor(private readonly client: RedisClient) {
    client.on('error', error => {
      logger.error(error, `Redis error`)
    })
  }

  private async ensureConnected() {
    if (!this.client.isOpen) {
      await this.client.connect()
    }
  }

  public async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.ensureConnected()
    await this.client.setEx(`${this.prefix}${key}`, durationSeconds, token)
  }

  public async getToken(key: string): Promise<string> {
    await this.ensureConnected()
    return this.client.get(`${this.prefix}${key}`)
  }

  public getSystemToken = async (username?: string): Promise<string> => {
    const key = username || '%ANONYMOUS%'
    const token = await this.getToken(key)
    if (token) {
      return token
    }

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

    const response = await superagent
      .post(`${config.apis.hmppsAuth.url}/oauth/token`)
      .set('Authorization', clientToken)
      .set('content-type', 'application/x-www-form-urlencoded')
      .send(authRequest)
      .timeout(config.apis.hmppsAuth.timeout)

    // Set the TTL slightly less than expiry of token
    await this.setToken(key, response.body.access_token, response.body.expires_in - 60)
    return response.body.access_token
  }
}
