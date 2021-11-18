import express, { Router } from 'express'
import helmet from 'helmet'

export default function setUpWebSecurity(): Router {
  const router = express.Router()

  // Secure code best practice - see:
  // 1. https://expressjs.com/en/advanced/best-practice-security.html,
  // 2. https://www.npmjs.com/package/helmet
  router.use(
    helmet({
      referrerPolicy: { policy: 'same-origin' },
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          // Hash allows inline script pulled in from https://github.com/alphagov/govuk-frontend/blob/master/src/govuk/template.njk
          scriptSrc: ["'self'", 'code.jquery.com', "'sha256-+6WnXIl4mbFTCARd8N3COQmT3bJJmo32N8q8ZSQAIcU='"],
          imgSrc: ["'self'", 'www.googletagmanager.com', 'www.googleanalytics.com', 'https://code.jquery.com'],
          connectSrc: ["'self'", 'www.googletagmanager.com', 'www.google-analytics.com'],
          styleSrc: ["'self'", 'code.jquery.com'],
          fontSrc: ["'self'"],
        },
      },
    })
  )
  return router
}
