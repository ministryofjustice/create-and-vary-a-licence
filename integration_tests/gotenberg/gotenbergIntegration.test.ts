import { PDFParse } from 'pdf-parse'

import GotenbergClient from '../../server/data/gotenbergClient'

describe('Gotenberg API integration', () => {
  const gotenbergUrl = 'http://localhost:3002'
  const client = new GotenbergClient(gotenbergUrl)
  const htmlString = '<html><head><title>A title</title></head><body><p>A document</p></body>'

  describe('Render a PDF file from HTML', () => {
    it('should render a PDF', async () => {
      const pdf = await client.renderPdfFromHtml(htmlString)
      const parser = new PDFParse(pdf)
      const result = await parser.getText()
      expect(result.text).toContain('A document')
    })
  })
})
