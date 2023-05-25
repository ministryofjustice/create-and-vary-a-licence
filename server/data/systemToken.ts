import querystring from 'querystring'
import superagent from 'superagent'

import logger from '../../logger'
import generateOauthClientToken from '../authentication/clientCredentials'
import config from '../config'

export type SystemToken = { token: string; expiresIn: number }
export type SystemTokenSupplier = (username?: string) => Promise<SystemToken>

export const getSystemToken: SystemTokenSupplier = async (username?: string): Promise<SystemToken> => {
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

  return { token: response.body.access_token, expiresIn: response.body.expires_in }
}
