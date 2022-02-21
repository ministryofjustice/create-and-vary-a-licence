import fs from 'fs'
import nock from 'nock'
import { Readable } from 'stream'
import HmppsRestClient from './hmppsRestClient'
import { ApiConfig } from '../config'

jest.mock('./tokenStore', () => {
  return jest.fn().mockImplementation(() => {
    return { TokenStore: () => '', getSystemToken: () => 'token' }
  })
})

const restClient = new HmppsRestClient('Rest Client', { url: 'http://localhost:8080' } as ApiConfig)

describe('Hmpps Rest Client tests', () => {
  afterEach(() => {
    jest.resetAllMocks()
    nock.abortPendingRequests()
    nock.cleanAll()
  })

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

  describe('STREAM', () => {
    it('Should return response body as a stream', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .get('/test')
        .reply(200, [1, 2, 3])

      const result = (await restClient.stream({ path: '/test', headers: { header1: 'headerValue1' } })) as Readable

      expect(nock.isDone()).toBe(true)
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

      expect(nock.isDone()).toBe(true)
      expect(result.read()).toEqual([1, 2, 3])
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .get('/test')
        .reply(404, { success: false })

      let error
      try {
        await restClient.stream({
          path: '/test',
          headers: { header1: 'headerValue1' },
        })
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('Not Found')
      expect(nock.isDone()).toBe(true)
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
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(200, { success: true })

      const result = await restClient.postMultiPart({
        path: '/test',
        headers: { header1: 'headerValue1' },
        fileToUpload: multiPartFile,
      })

      await fs.unlinkSync('test-file.txt')
      expect(nock.isDone()).toBe(true)
      expect(result).toEqual({ success: true })
    })

    it('Should throw error when no file provided', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(200, { success: true })

      let error
      try {
        await restClient.postMultiPart({
          path: '/test',
          headers: { header1: 'headerValue1' },
          fileToUpload: null,
        })
      } catch (e) {
        error = e
      }

      expect(error).toBeDefined()
      expect(error.message).toBe("Cannot read property 'path' of null")
      expect(nock.isDone()).toBe(false)
    })

    it('Should throw error when endpoint not found', async () => {
      await fs.writeFileSync('test-file.txt', 'a test file')

      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .post('/test')
        .reply(404, { success: false })

      let error
      try {
        await restClient.postMultiPart({
          path: '/test',
          headers: { header1: 'headerValue1' },
          fileToUpload: multiPartFile,
        })
      } catch (e) {
        error = e
      }

      await fs.unlinkSync('test-file.txt')
      expect(error).toBeDefined()
      expect(error.message).toBe('Not Found')
      expect(nock.isDone()).toBe(true)
    })
  })

  describe('DELETE', () => {
    it('Should return raw response body', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(200, { success: true })

      const result = await restClient.delete({
        path: '/test',
        headers: { header1: 'headerValue1' },
        raw: true,
      })

      expect(nock.isDone()).toBe(true)
      expect(result).toMatchObject({
        req: { method: 'DELETE' },
        status: 200,
        text: '{"success":true}',
      })
    })

    it('Should return response body data only', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(200, { success: true })

      const result = await restClient.delete({
        path: '/test',
        headers: { header1: 'headerValue1' },
      })

      expect(nock.isDone()).toBe(true)
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

      expect(nock.isDone()).toBe(true)
      expect(result).toEqual({ success: true })
    })

    it('Should throw error when bad response', async () => {
      nock('http://localhost:8080', {
        reqheaders: { authorization: 'Bearer token', header1: 'headerValue1' },
      })
        .delete('/test')
        .reply(404, { success: true })

      let error
      try {
        await restClient.delete({
          path: '/test',
          headers: { header1: 'headerValue1' },
        })
      } catch (e) {
        error = e
      }

      expect(error.message).toBe('Not Found')
      expect(nock.isDone()).toBe(true)
    })
  })
})
