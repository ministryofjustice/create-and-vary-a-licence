import express, { Router, Express } from 'express'
import cookieSession from 'cookie-session'
import createError from 'http-errors'
import path from 'path'

import allRoutes from '../index'
import nunjucksSetup from '../../utils/nunjucksSetup'
import errorHandler from '../../errorHandler'
import UserService from '../../services/userService'
import LicenceService from '../../services/licenceService'
import PrisonerService from '../../services/prisonerService'
import CommunityService from '../../services/communityService'
import * as auth from '../../authentication/auth'
import { AuthRole } from '../../middleware/authorisationMiddleware'
import { Services } from '../../services'

const user = {
  name: 'john smith',
  firstName: 'john',
  lastName: 'smith',
  username: 'user1',
  displayName: 'John Smith',
}

class MockUserService extends UserService {
  constructor() {
    super(undefined)
  }

  async getUser(token: string) {
    return {
      token,
      ...user,
    }
  }
}

function appSetup({
  router,
  userRoles = [AuthRole.OMU],
  production = false,
}: {
  router: Router
  userRoles?: AuthRole[]
  production?: boolean
}): Express {
  const app = express()

  app.set('view engine', 'njk')

  nunjucksSetup(app, path)

  app.use((req, res, next) => {
    req.user = { username: 'user1', token: 'token1', authSource: 'nomis' }
    res.locals = { user: { ...req.user, userRoles } }
    next()
  })

  app.use(cookieSession({ keys: [''] }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use('/', router)
  app.use((req, res, next) => next(createError(404, 'Not found')))
  app.use(errorHandler(production))

  return app
}

// eslint-disable-next-line import/prefer-default-export
export const appWithAllRoutes = (
  overrides: Partial<Services> = {},
  userRoles = [AuthRole.OMU],
  production?: boolean
): Express => {
  const router = allRoutes({
    userService: new MockUserService(),
    prisonerService: {} as PrisonerService,
    licenceService: {} as LicenceService,
    communityService: {} as CommunityService,
    ...overrides,
  })
  auth.default.authenticationMiddleware = () => (req, res, next) => next()
  return appSetup({ router, userRoles, production })
}
