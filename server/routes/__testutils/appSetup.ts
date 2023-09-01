import express, { type Express, type Locals } from 'express'
import createError from 'http-errors'

import wpipRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import AuthRole from '../../enumeration/authRole'
import { User } from '../../@types/CvlUserDetails'

export const user = {
  username: 'Joe Bloggs',
}

const signedCookiesProvider = jest.fn()

export const flashProvider = jest.fn()

function appSetup(services: Services, userSupplier: () => User): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, services.conditionService)
  app.use((req, res, next) => {
    req.user = userSupplier()
    req.flash = flashProvider
    req.signedCookies = signedCookiesProvider()
    res.locals = {} as Locals
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
  userSupplier = () => user as User,
}: {
  production?: boolean
  services?: Partial<Services>
  userSupplier?: () => User
  roles?: AuthRole[]
  signedCookies?: () => Record<string, Record<string, string>>
}): Express {
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup(services as Services, userSupplier)
}
