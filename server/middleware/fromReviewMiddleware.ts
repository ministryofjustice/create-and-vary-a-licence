import { RequestHandler } from 'express'

export default function addQueryParameterToViewContext(): RequestHandler {
  return (req, res, next): void => {
    if (req.method === 'GET') {
      res.locals.fromReview = req.query?.fromReview
      res.locals.fromPolicyReview = req.query?.fromPolicyReview
    }
    return next()
  }
}
