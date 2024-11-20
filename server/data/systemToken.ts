import querystring from 'querystring'
import superagent from 'superagent'

import logger from '../../logger'
import generateOauthClientToken from '../authentication/clientCredentials'
import config from '../config'

export type SystemToken = { token: string; expiresIn: number }
export type SystemTokenSupplier = (username?: string) => Promise<SystemToken>

const authHeaderValue = generateOauthClientToken(
  config.apis.hmppsAuth.systemClientId,
  config.apis.hmppsAuth.systemClientSecret,
)

export const getSystemToken: SystemTokenSupplier = async (username?: string): Promise<SystemToken> => {
  const authRequest = username
    ? querystring.stringify({ grant_type: 'client_credentials', username })
    : querystring.stringify({ grant_type: 'client_credentials' })

  logger.info(
    `HMPPS Auth request '${authRequest}' for client id '${config.apis.hmppsAuth.systemClientId}' and user '${username}'`,
  )

  const response = await superagent
    .post(`${config.apis.hmppsAuth.url}/oauth/token`)
    .set('Authorization', authHeaderValue)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(authRequest)
    .timeout(config.apis.hmppsAuth.timeout)

  return { token: response.body.access_token, expiresIn: response.body.expires_in }
}

export const getSystemTokenWithRetries: SystemTokenSupplier = async (): Promise<SystemToken> => {
  logger.info(`HMPPS Auth client creds request for client id '${config.apis.hmppsAuth.systemClientId}'`)

  const response = await superagent
    .post(`${config.apis.hmppsAuth.url}/oauth/token`)
    .set('Authorization', authHeaderValue)
    .set('content-type', 'application/x-www-form-urlencoded')
    .retry(2, err => {
      if (err) logger.info(`Retry handler for token call with ${err.code} ${err.message}`)
      return undefined // retry handler only for logging retries, not to influence retry logic
    })
    .send(querystring.stringify({ grant_type: 'client_credentials' }))
    .timeout(config.apis.hmppsAuth.timeout)

  return { token: response.body.access_token, expiresIn: response.body.expires_in }
}
