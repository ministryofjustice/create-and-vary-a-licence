import crypto from 'crypto'
import { IncomingMessage } from 'http'
import express, { Router, Response } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  router.use((_req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
    next()
  })

  const scriptSrc = [
    "'self'",
    (_req: IncomingMessage, res: Response) => `'nonce-${res.locals.cspNonce}'`,
    'code.jquery.com',
    '*.googletagmanager.com',
    'www.google-analytics.com',
    "'sha256-GUQ5ad8JK5KmEWmROf3LZd9ge94daqNvd8xy9YS1iDw='",
  ]
  const styleSrc = [
    "'self'",
    (_req: IncomingMessage, res: Response) => `'nonce-${res.locals.cspNonce}'`,
    'code.jquery.com',
    'fonts.googleapis.com',
  ]
  const fontSrc = ["'self'", 'fonts.gstatic.com']
  const imgSrc = [
    "'self'",
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com',
    'https://code.jquery.com',
    'data:',
  ]
  const formAction = [`'self' ${config.apis.hmppsAuth.externalUrl} ${config.dpsUrl}`]

  if (config.apis.frontendComponents.url) {
    scriptSrc.push(config.apis.frontendComponents.url)
    styleSrc.push(config.apis.frontendComponents.url)
    imgSrc.push(config.apis.frontendComponents.url)
    fontSrc.push(config.apis.frontendComponents.url)
  }

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      referrerPolicy: { policy: 'same-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc,
          imgSrc,
          connectSrc: ["'self'", '*.googletagmanager.com', '*.google-analytics.com', '*.analytics.google.com'],
          styleSrc,
          fontSrc,
          formAction,
        },
      },
    }),
  )
  return router
}
