import jwtDecode from 'jwt-decode'
import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import { convertToTitleCase } from '../utils/utils'

/**
 * This middleware checks whether a token is present and if user information is populated in the session.
 * If no user information is present it will populate values into req.session.currentUser based on the
 * auth_source (nomis, delius or other) from the token and persist it in the user's session information and Redis
 * in the key 'currentUser'.
 *
 * If user information is already present in their session it is populated into res.locals.users for use in
 * subsequent handlers.
 *
 * Passport already stores some user information (token, username and userRoles) into the session during authentication
 * and this is also visible in Redis as part of the 'passport' user session object.
 *
 * @param userService
 */

export type CvlUserDetails = {
  authSource: string
  name: string
  displayName: string
  activeCaseload: string
  prisonCaseload: string[]
  nomisStaffId: number
  deliusStaffIdentifier: number
  probationTeams: string[]
  probationLdus: string[]
  probationPdus: string[]
  probationAreas: string[]
  emailAddress: string
}

// These values will be set by default and overridden below
const defaultUserDetails = {
  prisonCaseload: [],
  probationTeams: [],
  probationLdus: [],
  probationPdus: [],
  probationAreas: [],
} as CvlUserDetails

export default function populateCurrentUser(userService: UserService): RequestHandler {
  return async (req, res, next) => {
    try {
      // Populate the currentUser details in the request session if there is a token present and no user details
      if (res.locals.user?.token) {
        const userInSession = getCurrentUserInSession(req)
        if (!userInSession) {
          logger.info(`populateCurrentUser - populating the user details in session data`)
          // eslint-disable-next-line camelcase
          const { auth_source: authSource } = jwtDecode(res.locals.user.token) as { auth_source: string }
          const cvlUser = { ...defaultUserDetails, authSource }

          if (authSource === 'nomis') {
            logger.info(`authSource === nomis -> Getting prison values`)
            const [prisonUser, prisonUserCaseload] = await Promise.all([
              userService.getPrisonUser(res.locals.user.token),
              userService.getPrisonUserCaseloads(res.locals.user.token),
            ])
            cvlUser.name = `${prisonUser.firstName} ${prisonUser.lastName}`
            cvlUser.displayName = cvlUser.name ? convertToTitleCase(cvlUser.name) : 'Unknown'
            cvlUser.activeCaseload = prisonUser.activeCaseLoadId
            cvlUser.nomisStaffId = prisonUser.staffId
            cvlUser.prisonCaseload = prisonUserCaseload
              .map(cs => (cs.currentlyActive ? cs.caseLoadId : null))
              .filter(cs => cs)
          }

          if (authSource === 'delius') {
            logger.info(`authSource === delius -> Getting probation values`)
            // staffIdentifier, teams, LDUs, PDUs, provider (area)
          }

          // Get the auth details for all users - name and displayName - must succeed here
          const authUser = await userService.getAuthUser(res.locals.user.token)
          if (authUser) {
            cvlUser.name = authUser.name
            cvlUser.displayName = cvlUser.name ? convertToTitleCase(cvlUser.name) : 'Unknown'
          }

          try {
            // Get the user's email, which may fail (unverified returns a 204) - catch and swallow the error
            const authEmail = await userService.getAuthUserEmail(res.locals.user.token)
            if (authEmail) {
              cvlUser.emailAddress = authEmail.email
            }
          } catch (error) {
            logger.info(`Swallowing error for getAuthUserEmail ${error?.statusCode} for ${cvlUser.displayName}`)
          }

          setCurrentUserInSession(req, cvlUser)
          res.locals.user = { ...res.locals.user, ...cvlUser }
        } else {
          logger.info(`populateCurrentUser - session data for the user is already present`)
          res.locals.user = { ...res.locals.user, ...userInSession }
        }
      }
      next()
    } catch (error) {
      logger.error(error, `Failed to get user details for: ${res.locals.user?.username}`)
      next(error)
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setCurrentUserInSession = (req: any, cvlUser: CvlUserDetails) => {
  req.session.currentUser = cvlUser
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getCurrentUserInSession = (req: any): CvlUserDetails => {
  return req.session?.currentUser
}
