import fs from 'fs'
import { Readable } from 'stream'
import nock from 'nock'
import HmppsRestClient from './hmppsRestClient'
import { ApiConfig } from '../config'
import { InMemoryTokenStore } from './tokenStore'

const restClient = new HmppsRestClient(
  new InMemoryTokenStore(async _username => ({ token: 'token-1', expiresIn: 1234 })),
  'Rest Client',
  { url: 'http://localhost:8080' } as ApiConfig
)

describe('Hmpps Rest Client tests', () => {
  afterEach(() => {
    jest.resetAllMocks()
    nock.abortPendingRequests()
    nock.cleanAll()
  })

  describe('GET', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(200, { success: true })

      const result = await restClient.get({
        path: '/test',
        query: { query1: 'value1' },
        headers: { header1: 'headerValue1' },
        raw: true,
      })

      expect(result).toMatchObject({
        req: { method: 'GET' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(200, { success: true })

      const result = await restClient.get({
        path: '/test',
        query: { query1: 'value1' },
        headers: { header1: 'headerValue1' },
      })

      expect(result).toEqual({ success: true })
    })

    it('Should use the supplied token as signature', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer user token', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(200, { success: true })

      const result = await restClient.get(
        {
          path: '/test',
          query: { query1: 'value1' },
          headers: { header1: 'headerValue1' },
        },
        { token: 'user token', username: 'joebloggs' }
      )

      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(404, { success: false })

      await expect(
        restClient.get({
          path: '/test',
          query: { query1: 'value1' },
          headers: { header1: 'headerValue1' },
        })
      ).rejects.toThrow('Not Found')
    })

    it('Should not throw an error should return null on 404 if allow404 is true', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test?query1=value1')
        .reply(404, { success: false })

      await expect(
        restClient.get({
          path: '/test',
          query: { query1: 'value1' },
          headers: { header1: 'headerValue1' },
          return404: true,
        })
      ).resolves.toStrictEqual(null)
    })

    it('Should retry twice if request fails', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test')
        .reply(500, { failure: 'one' })
        .get('/test')
        .reply(500, { failure: 'two' })
        .get('/test')
        .reply(200, { testData1: 'testValue1' })

      await expect(
        restClient.get({
          path: '/test',
          headers: { header1: 'headerValue1' },
        })
      ).resolves.toStrictEqual({ testData1: 'testValue1' })
    })
  })

  describe('POST', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .post('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      await expect(
        restClient.post({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
          raw: true,
        })
      ).resolves.toMatchObject({
        req: { method: 'POST' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
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

      expect(result).toEqual({ success: true })
    })

    it('Should accept the supplied token as signature', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer user token', header1: 'headerValue1' },
      })
        .post('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      const result = await restClient.post(
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        },
        { token: 'user token', username: 'joebloggs' }
      )

      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .post('/test', { testData1: 'testValue1' })
        .reply(404, { success: true })

      await expect(
        restClient.post({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        })
      ).rejects.toThrow('Not Found')
    })

    it('Should not retry if request fails', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(500)

      await expect(
        restClient.post({
          path: '/test',
          headers: { header1: 'headerValue1' },
        })
      ).rejects.toThrow('Internal Server Error')

      expect(nock.isDone()).toBe(true)
    })
  })

  describe('PUT', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      await expect(
        restClient.put({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
          raw: true,
        })
      ).resolves.toMatchObject({
        req: { method: 'PUT' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      await expect(
        restClient.put({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        })
      ).resolves.toEqual({ success: true })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer user token', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(200, { success: true })

      const result = await restClient.put(
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        },
        { token: 'user token', username: 'joebloggs' }
      )

      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .put('/test', { testData1: 'testValue1' })
        .reply(404, { success: true })

      await expect(
        restClient.put({
          path: '/test',
          headers: { header1: 'headerValue1' },
          data: {
            testData1: 'testValue1',
          },
        })
      ).rejects.toThrowError('Not Found')
    })
  })

  describe('STREAM', () => {
    it('Should return response body as a stream', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test')
        .reply(200, [1, 2, 3])

      const result = (await restClient.stream({ path: '/test', headers: { header1: 'headerValue1' } })) as Readable

      expect(result.read()).toEqual([1, 2, 3])
    })

    it('Should use the supplied token as signature', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer user token', header1: 'headerValue1' },
      })
        .get('/test')
        .reply(200, [1, 2, 3])

      const result = (await restClient.stream(
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
        },
        { token: 'user token', username: 'joebloggs' }
      )) as Readable

      expect(result.read()).toEqual([1, 2, 3])
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .get('/test')
        .reply(404, { success: false })

      await expect(
        restClient.stream({
          path: '/test',
          headers: { header1: 'headerValue1' },
        })
      ).rejects.toThrow('Not Found')
    })
  })

  describe('POST MULTIPART', () => {
    const multiPartFile = {
      path: 'test-file.txt',
      originalname: 'test',
      mimetype: 'application/text',
    } as Express.Multer.File

    it('Should accept a file upload', async () => {
      await fs.writeFileSync('test-file.txt', 'a test file')

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(200, { success: true })

      const result = await restClient.postMultiPart({
        path: '/test',
        headers: { header1: 'headerValue1' },
        fileToUpload: multiPartFile,
      })

      await fs.unlinkSync('test-file.txt')

      expect(result).toEqual({ success: true })
    })

    it('Should throw error when no file provided', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(200, { success: true })

      await expect(
        restClient.postMultiPart({
          path: '/test',
          headers: { header1: 'headerValue1' },
          fileToUpload: null,
        })
      ).rejects.toThrow("Cannot read properties of null (reading 'path')")

      expect(nock.isDone()).toBe(false)
    })

    it('Should throw error when endpoint not found', async () => {
      await fs.writeFileSync('test-file.txt', 'a test file')

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(404, { success: false })

      await expect(
        restClient.postMultiPart({
          path: '/test',
          headers: { header1: 'headerValue1' },
          fileToUpload: multiPartFile,
        })
      ).rejects.toThrow('Not Found')

      await fs.unlinkSync('test-file.txt')
    })
  })

  describe('DELETE', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(200, { success: true })

      const result = await restClient.delete({
        path: '/test',
        headers: { header1: 'headerValue1' },
        raw: true,
      })

      expect(result).toMatchObject({
        req: { method: 'DELETE' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(200, { success: true })

      const result = await restClient.delete({
        path: '/test',
        headers: { header1: 'headerValue1' },
      })

      expect(result).toEqual({ success: true })
    })

    it('Should accept the supplied token as signature', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer user token', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(200, { success: true })

      const result = await restClient.delete(
        {
          path: '/test',
          headers: { header1: 'headerValue1' },
        },
        { token: 'user token', username: 'joebloggs' }
      )

      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token-1', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(404, { success: true })

      await expect(
        restClient.delete({
          path: '/test',
          headers: { header1: 'headerValue1' },
        })
      ).rejects.toThrow('Not Found')
    })
  })
})
