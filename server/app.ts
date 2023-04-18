// eslint-disable-next-line import/no-extraneous-dependencies
import 'reflect-metadata'
import express from 'express'

import createError from 'http-errors'
import csurf from 'csurf'
import setupRoutes from './routes'
import nunjucksSetup from './utils/nunjucksSetup'
import errorHandler from './errorHandler'
import { Services } from './services'
import GotenbergClient from './data/gotenbergClient'
import pdfRenderer from './utils/pdfRenderer'
import config from './config'

import setUpWebSession from './middleware/setUpWebSession'
import setUpStaticResources from './middleware/setUpStaticResources'
import setUpWebSecurity from './middleware/setUpWebSecurity'
import setUpAuthentication from './middleware/setUpAuthentication'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import trimRequestBody from './middleware/trimBodyMiddleware'

const testMode = process.env.NODE_ENV === 'test'

export default function createApp(services: Services): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(setUpHealthChecks())
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, services.conditionService)
  app.use(setUpAuthentication())
  app.use(pdfRenderer(new GotenbergClient(config.apis.gotenberg.apiUrl)))
  app.use(trimRequestBody())

  // CSRF protection
  if (!testMode) {
    app.use(csurf())
  }

  app.use(authorisationMiddleware)
  app.use(setupRoutes(services))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler())

  return app
}
