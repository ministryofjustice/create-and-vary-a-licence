import express, { type Express, type Locals } from 'express'
import createError from 'http-errors'

import cvlRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import * as auth from '../../authentication/auth'
import type { Services } from '../../services'
import AuthRole from '../../enumeration/authRole'
import { User } from '../../@types/CvlUserDetails'
import type { ApplicationInfo } from '../../applicationInfo'
import setUpHealthChecks from '../../middleware/setUpHealthChecks'

const testAppInfo: ApplicationInfo = {
  applicationName: 'test',
  buildNumber: '1',
  gitRef: 'long ref',
  gitShortHash: 'short ref',
  branchName: 'main',
  productId: 'DPS01',
}

export const user = {
  username: 'Joe Bloggs',
  userRoles: ['ROLE_LICENCE_RO'],
  probationTeamCodes: ['ABC123'],
}

const signedCookiesProvider = jest.fn()

export const flashProvider = jest.fn()

function appSetup(services: Services, userSupplier: () => User): Express {
  const app = express()

  app.set('view engine', 'njk')

  const nunjucksEnvironment = nunjucksSetup(app, testAppInfo)
  app.use(setUpHealthChecks(testAppInfo))
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
  app.use(cvlRoutes(services, nunjucksEnvironment))
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
  const overrideServices = { dprServices: { downloadPermissionService: { enabled: true } }, ...services } as Services
  return appSetup(overrideServices, userSupplier)
}
