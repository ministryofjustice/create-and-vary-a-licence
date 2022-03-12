import nock from 'nock'
import GotenbergClient from './gotenbergClient'

describe('Gotenberg client tests', () => {
  let fakeApi: nock.Scope
  const gotenbergUrl = 'http://localhost:8200'

  beforeEach(() => {
    fakeApi = nock(gotenbergUrl)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  const client = new GotenbergClient(gotenbergUrl)

  const pdfStream = Buffer.from('some PDF encoded data')
  const htmlString = '<html><head><title>A title</title></head><body><p>A document</p></body>'

  describe('Render HTML as PDF', () => {
    it('POST /forms/chromium/convert/html', async () => {
      fakeApi.post('/forms/chromium/convert/html').reply(200, pdfStream)
      const data = await client.renderPdfFromHtml(htmlString)
      expect(data).toEqual(Buffer.from(pdfStream))
      expect(nock.isDone()).toBe(true)
    })
  })
})
