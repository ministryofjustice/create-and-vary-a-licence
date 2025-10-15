import 'reflect-metadata'
import express from 'express'

import createError from 'http-errors'
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
import setUpCsrf from './middleware/setUpCsrf'
import setUpHealthChecks from './middleware/setUpHealthChecks'
import setUpWebRequestParsing from './middleware/setupRequestParsing'
import authorisationMiddleware from './middleware/authorisationMiddleware'
import trimRequestBody from './middleware/trimBodyMiddleware'
import phaseNameSetup from './middleware/phaseNameSetup'
import getFrontendComponents from './middleware/getFeComponents'
import { ApplicationInfo } from './applicationInfo'
import appInsightsMiddleware from './middleware/appInsightsMiddleware'

export default function createApp(services: Services, applicationInfo: ApplicationInfo): express.Application {
  const app = express()

  app.set('json spaces', 2)
  app.set('trust proxy', true)
  app.set('port', process.env.PORT || 3000)

  app.use(appInsightsMiddleware())
  app.use(setUpHealthChecks(applicationInfo))
  app.use(setUpWebSecurity())
  app.use(setUpWebSession())
  app.use(setUpWebRequestParsing())
  app.use(setUpStaticResources())
  nunjucksSetup(app, applicationInfo)
  phaseNameSetup(app, config.phaseName)
  app.use(setUpAuthentication())
  app.use(pdfRenderer(new GotenbergClient(config.apis.gotenberg.url)))
  app.use(trimRequestBody())
  app.use(authorisationMiddleware)
  app.use(setUpCsrf())
  app.get(/(.*)/, getFrontendComponents(services))
  app.use(setupRoutes(services))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler())

  return app
}
