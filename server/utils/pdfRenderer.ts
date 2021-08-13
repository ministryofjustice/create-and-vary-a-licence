import { Request, Response, NextFunction } from 'express'
import GotenbergClient, { PdfOptions } from '../data/gotenbergClient'
import logger from '../../logger'

/*
 * This function accepts a Gotenberg client as its only argument.
 * It returns a handler function to render a normal HTML view template to
 * produce the raw HTML (including images, stylesheet etc). It then uses a
 * callback function to pass rendered HTML view into the Gotenberg client
 * to produce and return a PDF document.
 */

// TODO: Revisit to fully define these types for the "any" placeholders
export default function pdfRenderer(client: GotenbergClient) {
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,@typescript-eslint/no-explicit-any
  return (req: Request, res: Response, next: NextFunction) => {
    res.renderPDF = (
      view: string,
      // Define the pageData as - { url: string, licence: Licence, otherData: type? }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pageData: any,
      options: { filename: string; pdfOptions: PdfOptions } = { filename: 'document.pdf', pdfOptions: {} }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      res.render(view, pageData, (error: any, html: any) => {
        if (error) {
          throw error
        }

        res.header('Content-Type', 'application/pdf')
        res.header('Content-Transfer-Encoding', 'binary')
        res.header('Content-Disposition', `inline; filename=${options.filename}`)

        return client
          .renderPdfFromHtml(html, options?.pdfOptions)
          .then(buffer => res.send(buffer))
          .catch(reason => {
            logger.warn(reason)
          })
      })
    }
    next()
  }
}
