import { Readable } from 'stream'
import querystring, { ParsedUrlQueryInput } from 'querystring'
import superagent from 'superagent'
import Agent, { HttpsAgent } from 'agentkeepalive'

import logger from '../../logger'
import sanitiseError from '../sanitisedError'
import { ApiConfig } from '../config'
import type { UnsanitisedError } from '../sanitisedError'
import type { TokenStore } from './tokenStore'

interface GetRequest {
  userToken?: string
  path?: string
  query?: ParsedUrlQueryInput
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
  return404?: boolean
}

interface PostRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown> | number[] | string[] | Record<string, unknown>[]
  query?: ParsedUrlQueryInput
  raw?: boolean
  returnBodyOnErrorIfPredicate?: (e: superagent.ResponseError) => boolean
}

interface PostMultiPartRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  fileToUpload: Express.Multer.File
}

interface PutRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  data?: Record<string, unknown> | number[] | string[] | Record<string, unknown>[]
  raw?: boolean
}

interface DeleteRequest {
  path?: string
  headers?: Record<string, string>
  responseType?: string
  raw?: boolean
}

interface StreamRequest {
  path?: string
  headers?: Record<string, string>
  errorLogger?: (e: UnsanitisedError) => void
}

interface SignedWithMethod {
  token?: string
  username?: string
}

export default class HmppsRestClient {
  private agent: Agent

  constructor(
    private readonly tokenStore: TokenStore,
    private readonly name: string,
    private readonly apiConfig: ApiConfig,
  ) {
    this.agent = apiConfig.url.startsWith('https') ? new HttpsAgent(apiConfig.agent) : new Agent(apiConfig.agent)
  }

  async get(
    { path = null, query = {}, headers = {}, responseType = '', raw = false, return404 = false }: GetRequest,
    signedWithMethod?: SignedWithMethod,
  ): Promise<unknown> {
    const signedWith = signedWithMethod?.token || (await this.tokenStore.getSystemToken(signedWithMethod?.username))

    logger.info(`Get using admin client credentials: calling ${this.name}: ${path}?${querystring.stringify(query)}`)
    return superagent
      .get(`${this.apiConfig.url}${path}`)
      .agent(this.agent)
      .set('Content-Type', 'application/json')
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .query(query)
      .auth(signedWith, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.apiConfig.timeout)
      .then(response => {
        return raw ? response : response.body
      })
      .catch((error): void => {
        if (return404 && error.status === 404) {
          return null
        }
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError, query }, `Error calling ${this.name}, path: '${path}', verb: 'GET'`)
        throw sanitisedError
      })
  }

  async post(
    {
      path = null,
      headers = {},
      responseType = '',
      data = {},
      query = {},
      raw = false,
      returnBodyOnErrorIfPredicate,
    }: PostRequest,
    signedWithMethod?: SignedWithMethod,
  ): Promise<unknown> {
    const signedWith = signedWithMethod?.token || (await this.tokenStore.getSystemToken(signedWithMethod?.username))

    logger.info(`Post using admin client credentials: calling ${this.name}: ${path}?${querystring.stringify(query)}`)
    return superagent
      .post(`${this.apiConfig.url}${path}`)
      .send(data)
      .set('Content-Type', 'application/json')
      .agent(this.agent)
      .query(query)
      .auth(signedWith, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.apiConfig.timeout)
      .then(response => {
        return raw ? response : response.body
      })
      .catch(error => {
        if (returnBodyOnErrorIfPredicate && returnBodyOnErrorIfPredicate(error)) {
          return error.response.body
        }
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
        throw sanitisedError
      })
  }

  async put(
    { path = null, headers = {}, responseType = '', data = {}, raw = false }: PutRequest,
    signedWithMethod?: SignedWithMethod,
  ): Promise<unknown> {
    const signedWith = signedWithMethod?.token || (await this.tokenStore.getSystemToken(signedWithMethod?.username))

    logger.info(`Put using admin client credentials: calling ${this.name}: ${path}`)
    return superagent
      .put(`${this.apiConfig.url}${path}`)
      .send(data)
      .set('Content-Type', 'application/json')
      .agent(this.agent)
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .auth(signedWith, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.apiConfig.timeout)
      .then(response => {
        return raw ? response : response.body
      })
      .catch(error => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'PUT'`)
        throw sanitisedError
      })
  }

  async stream({ path = null, headers = {} }: StreamRequest, signedWithMethod?: SignedWithMethod): Promise<unknown> {
    const signedWith = signedWithMethod?.token || (await this.tokenStore.getSystemToken(signedWithMethod?.username))

    logger.info(`Get using admin client credentials: calling ${this.name}: ${path}`)
    return superagent
      .get(`${this.apiConfig.url}${path}`)
      .agent(this.agent)
      .set('Content-Type', 'application/json')
      .auth(signedWith, { type: 'bearer' })
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .timeout(this.apiConfig.timeout)
      .set(headers)
      .then(response => {
        const streamedResponse = Readable.from(response.body)
        streamedResponse.push(response.body)
        streamedResponse.push(null)
        return streamedResponse
      })
      .catch(error => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'GET (streamed)'`)
        throw sanitisedError
      })
  }

  async postMultiPart(
    { path = null, headers = {}, responseType = '', fileToUpload }: PostMultiPartRequest,
    signedWithMethod?: SignedWithMethod,
  ): Promise<unknown> {
    const signedWith = signedWithMethod?.token || (await this.tokenStore.getSystemToken(signedWithMethod?.username))
    logger.info(`PostMultiPartRequest using admin client credentials: calling ${this.name}: ${path}`)
    return superagent
      .post(`${this.apiConfig.url}${path}`)
      .attach('file', fileToUpload.path, { filename: fileToUpload.originalname, contentType: fileToUpload.mimetype })
      .agent(this.agent)
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .auth(signedWith, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.apiConfig.timeout)
      .then(response => {
        return response.body
      })
      .catch(error => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'POST'`)
        throw sanitisedError
      })
  }

  async delete(
    { path = null, headers = {}, responseType = '', raw = false }: DeleteRequest,
    signedWithMethod?: SignedWithMethod,
  ): Promise<unknown> {
    const signedWith = signedWithMethod?.token || (await this.tokenStore.getSystemToken(signedWithMethod?.username))

    logger.info(`Delete using admin client credentials: calling ${this.name}: ${path}`)
    return superagent
      .delete(`${this.apiConfig.url}${path}`)
      .agent(this.agent)
      .retry(2, err => {
        if (err) logger.info(`Retry handler found API error with ${err.code} ${err.message}`)
        return undefined // retry handler only for logging retries, not to influence retry logic
      })
      .auth(signedWith, { type: 'bearer' })
      .set(headers)
      .responseType(responseType)
      .timeout(this.apiConfig.timeout)
      .then(response => {
        return raw ? response : response.body
      })
      .catch(error => {
        const sanitisedError = sanitiseError(error)
        logger.warn({ ...sanitisedError }, `Error calling ${this.name}, path: '${path}', verb: 'DELETE'`)
        throw sanitisedError
      })
  }
}
