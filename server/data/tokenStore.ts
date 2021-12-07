import redis from 'redis'
import { promisify } from 'util'

import querystring from 'querystring'
import superagent from 'superagent'
import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'

const createRedisClient = () => {
  return redis.createClient({
    port: config.redis.port,
    password: config.redis.password,
    host: config.redis.host,
    tls: config.redis.tls_enabled === 'true' ? {} : false,
    prefix: 'systemToken:',
  })
}

export default class TokenStore {
  private readonly getRedisAsync: (key: string) => Promise<string>

  private readonly setRedisAsync: (key: string, value: string, mode: string, durationSeconds: number) => Promise<void>

  constructor(redisClient: redis.RedisClient = createRedisClient()) {
    redisClient.on('error', error => {
      logger.error(error, `Redis error`)
    })

    this.getRedisAsync = promisify(redisClient.get).bind(redisClient)
    this.setRedisAsync = promisify(redisClient.set).bind(redisClient)
  }

  public getAuthToken = async (username: string): Promise<string> => {
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

  private async setToken(key: string, token: string, durationSeconds: number): Promise<void> {
    await this.setRedisAsync(key, token, 'EX', durationSeconds)
  }

  private async getToken(key: string): Promise<string> {
    return this.getRedisAsync(key)
  }
}
