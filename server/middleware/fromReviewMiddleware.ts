import { RequestHandler } from 'express'

export default function addQueryParametersToViewContext(): RequestHandler {
  return (req, res, next): void => {
    if (req.method === 'GET') {
      if (req.query) {
        res.locals.fromReview = req.query?.fromReview
      }
    }
    return next()
  }
}
