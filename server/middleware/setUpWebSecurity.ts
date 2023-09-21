import crypto from 'crypto'
import express, { Router, Response } from 'express'
import helmet from 'helmet'
import config from '../config'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  router.use((req, res, next) => {
    res.locals.cspNonce = crypto.randomBytes(16).toString('base64')
    next()
  })

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
          scriptSrc: [
            "'self'",
            (req, res: Response) => `'nonce-${res.locals.cspNonce}'`,
            'code.jquery.com',
            '*.googletagmanager.com',
            'www.google-analytics.com',
            "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='",
          ],
          imgSrc: [
            "'self'",
            'https://www.googletagmanager.com',
            'https://www.google-analytics.com',
            'https://code.jquery.com',
            'data:',
          ],
          connectSrc: ["'self'", '*.googletagmanager.com', '*.google-analytics.com', '*.analytics.google.com'],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
          formAction: [`'self' ${config.apis.hmppsAuth.externalUrl}`],
        },
      },
    })
  )
  return router
}
