import nock from 'nock'
import HmppsRestClient from './hmppsRestClient'
import { ApiConfig } from '../config'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getAuthToken: () => 'token' }
  })
})

const restClient = new HmppsRestClient('Rest Client', { url: 'http://localhost:8080' } as ApiConfig)

describe('Hmpps Rest Client tests', () => {
  describe('GET', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(200, { success: true })

      const result = await restClient.get({
        path: '/test',
        query: { query1: 'value1' },
        headers: { header1: 'headerValue1' },
        raw: true,
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toMatchObject({
        req: { method: 'GET' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(200, { success: true })

      const result = await restClient.get({
        path: '/test',
        query: { query1: 'value1' },
        headers: { header1: 'headerValue1' },
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(404, { success: false })

      let error
      try {
        await restClient.get({
          path: '/test',
          query: { query1: 'value1' },
          headers: { header1: 'headerValue1' },
        })
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('Not Found')
      expect(nock.isDone()).toBe(true)
    })
  })

  describe('POST', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .post('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      const result = await restClient.post({
        path: '/test',
        headers: { header1: 'headerValue1' },
        data: {
          testData1: 'testValue1',
        },
        raw: true,
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toMatchObject({
        req: { method: 'POST' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .post('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      const result = await restClient.post({
        path: '/test',
        headers: { header1: 'headerValue1' },
        data: {
          testData1: 'testValue1',
        },
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .post('/test', { testData1: 'testValue1' })
        .reply(404, { success: true })

      let error
      try {
        await restClient.post({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        })
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('Not Found')
      expect(nock.isDone()).toBe(true)
    })
  })

  describe('PUT', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      const result = await restClient.put({
        path: '/test',
        headers: { header1: 'headerValue1' },
        data: {
          testData1: 'testValue1',
        },
        raw: true,
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toMatchObject({
        req: { method: 'PUT' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      const result = await restClient.put({
        path: '/test',
        headers: { header1: 'headerValue1' },
        data: {
          testData1: 'testValue1',
        },
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(404, { success: true })

      let error
      try {
        await restClient.put({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        })
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('Not Found')
      expect(nock.isDone()).toBe(true)
    })
  })
})
