import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'
import { Readable } from 'stream'

import querystring, { ParsedUrlQueryInput } from 'querystring'
import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import TokenStore from './tokenStore'

interface GetRequest {
  userToken?: string
  path?: string
  query?: ParsedUrlQueryInput
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown> | number[]
  raw?: boolean
}

interface PutRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown>
  raw?: boolean
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

export default class HmppsRestClient {
  private agent: Agent

  private tokenStore: TokenStore

  constructor(private readonly name: string, private readonly apiConfig: ApiConfig) {
    this.agent = apiConfig.url.startsWith('https') ? new HttpsAgent(apiConfig.agent) : new Agent(apiConfig.agent)
    this.tokenStore = new TokenStore()
  }

  async get(
    { path = null, query = {}, headers = {}, responseType = '', raw = false }: GetRequest,
    username?: string
  ): Promise<unknown> {
    const token = await this.tokenStore.getAuthToken(username)

    logger.info(`Get using admin client credentials: calling ${this.name}: ${path}?${querystring.stringify(query)}`)
    try {
      const result = await superagent
        .get(`${this.apiConfig.url}${path}`)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .query(query)
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.apiConfig.timeout)

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
      throw sanitisedError
    }
  }

  async post(
    { path = null, headers = {}, responseType = '', data = {}, raw = false }: PostRequest,
    username?: string
  ): Promise<unknown> {
    const token = await this.tokenStore.getAuthToken(username)

    logger.info(`Post using admin client credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .post(`${this.apiConfig.url}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.apiConfig.timeout)

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
      throw sanitisedError
    }
  }

  async put(
    { path = null, headers = {}, responseType = '', data = {}, raw = false }: PutRequest,
    username?: string
  ): Promise<unknown> {
    const token = await this.tokenStore.getAuthToken(username)

    logger.info(`Put using admin client credentials: calling ${this.name}: ${path}`)
    try {
      const result = await superagent
        .put(`${this.apiConfig.url}${path}`)
        .send(data)
        .agent(this.agent)
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .auth(token, { type: 'bearer' })
        .set(headers)
        .responseType(responseType)
        .timeout(this.apiConfig.timeout)

      return raw ? result : result.body
    } catch (error) {
      const sanitisedError = sanitiseError(error)
      logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PUT'`)
      throw sanitisedError
    }
  }

  async stream({ path = null, headers = {} }: StreamRequest, username?: string): Promise<unknown> {
    const token = await this.tokenStore.getAuthToken(username)

    logger.info(`Get using admin client credentials: calling ${this.name}: ${path}`)
    return new Promise((resolve, reject) => {
      superagent
        .get(`${this.apiConfig.url}${path}`)
        .agent(this.agent)
        .auth(token, { type: 'bearer' })
        .retry(2, (err, res) => {
          if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
          return undefined // retry handler only for logging retries, not to influence retry logic
        })
        .timeout(this.apiConfig.timeout)
        .set(headers)
        .end((error, response) => {
          if (error) {
            logger.info(`Error caught for get stream ${path}`)
            reject(error)
          } else if (response) {
            const streamedResponse = Readable.from(response.body)
            streamedResponse.push(response.body)
            streamedResponse.push(null)
            resolve(streamedResponse)
          }
        })
    })
  }
}
