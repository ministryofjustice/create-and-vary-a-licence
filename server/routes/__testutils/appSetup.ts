import express, { Express } from 'express'
import createError from 'http-errors'

import wpipRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import AuthRole from '../../enumeration/authRole'

export const user = {
  firstName: 'first',
  lastName: 'last',
  userId: 'id',
  token: 'token',
  username: 'user1',
  displayName: 'First Last',
  activeCaseLoadId: 'MDI',
  authSource: 'NOMIS',
  userRoles: ['AuthRole'],
}

const signedCookiesProvider = jest.fn()

export const flashProvider = jest.fn()

function appSetup(services: Services, userSupplier: () => Express.User): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, services.conditionService)
  app.use((req, res, next) => {
    req.user = userSupplier()
    req.flash = flashProvider
    req.signedCookies = signedCookiesProvider()
    res.locals = {}
    res.locals.user = { ...req.user }
    next()
  })
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(wpipRoutes(services))
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler())

  return app
}

export function appWithAllRoutes({
  services = {},
  userSupplier = () => user,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => Express.User
  roles?: AuthRole[]
  signedCookies?: () => Record<string, Record<string, string>>
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(services as Services, userSupplier)
}
