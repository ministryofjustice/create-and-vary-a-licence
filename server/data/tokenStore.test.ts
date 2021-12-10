import nock from 'nock'
import redis, { RedisClient } from 'redis-mock'
import TokenStore from './tokenStore'
import config from '../config'

let tokenStore: TokenStore
let redisClient: RedisClient

jest.mock('redis', () => redis)

jest.mock('../authentication/clientCredentials', () => {
  return jest.fn().mockImplementation(() => 'Basic clientId:secret')
})

beforeEach(() => {
  redisClient = redis.createClient()
  tokenStore = new TokenStore()
})

afterEach(done => {
  redisClient.flushall(done)
  jest.clearAllMocks()
  nock.cleanAll()
})

describe('Token Store', () => {
  it('Token for user is returned from redis is exists', async () => {
    redisClient.set('joebloggs', 'saved token')

    const token = await tokenStore.getSystemToken('joebloggs')

    expect(token).toEqual('saved token')
  })

  it('Auth is called to get and save a token for user if one is not saved', async () => {
    nock(config.apis.hmppsAuth.url, {
      reqheaders: { Authorization: 'Basic clientId:secret', 'content-type': 'application/x-www-form-urlencoded' },
    })
      .post('/oauth/token', { grant_type: 'client_credentials', username: 'joebloggs' })
      .reply(200, {
        access_token: 'generated user token',
        expires_in: 2000,
      })

    const token = await tokenStore.getSystemToken('joebloggs')

    expect(token).toEqual('generated user token')
    expect(nock.isDone()).toBe(true)
  })

  it('Auth is called to get and save a token for system if one is not saved', async () => {
    nock(config.apis.hmppsAuth.url, {
      reqheaders: { Authorization: 'Basic clientId:secret', 'content-type': 'application/x-www-form-urlencoded' },
    })
      .post('/oauth/token', { grant_type: 'client_credentials' })
      .reply(200, {
        access_token: 'generated system token',
        expires_in: 2000,
      })

    const token = await tokenStore.getSystemToken()

    expect(token).toEqual('generated system token')
    expect(nock.isDone()).toBe(true)
  })
})
