import { RequestHandler } from 'express'
import logger from '../../logger'
import UserService from '../services/userService'
import { convertToTitleCase } from '../utils/utils'

/**
 * This middleware checks whether a token is present and if user information is populated in the session.
 * If no user information is present it will populate values into req.session.currentUser based on the
 * auth_source (nomis, delius or other) and persists these in the user's session information and Redis
 * in the key 'currentUser', and is merged into res.locals.user.
 *
 * If user information is already present in this session it is merged into res.locals.users for use in
 * subsequent handlers.
 *
 * Passport already stores some user information (token, username, authSource and userRoles) into the
 * session during authentication, and this is also visible in Redis in the 'passport' key, and in
 * req.user and res.locals.user.
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
      // Populate the currentUser details in the session if there is a token present and no user details
      if (res.locals.user?.token) {
        const userInSession = getCurrentUserInSession(req)
        if (!userInSession) {
          logger.info(`populateCurrentUser - populating ${res.locals.user?.authSource} user in session`)
          const cvlUser = { ...defaultUserDetails, authSource: res.locals.user.authSource }

          if (cvlUser.authSource === 'nomis') {
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

          if (cvlUser.authSource === 'delius') {
            // staffIdentifier, teams, LDUs, PDUs, provider (area)
          }

          // Get the auth details for all users - name and displayName - must succeed here
          const authUser = await userService.getAuthUser(res.locals.user.token)
          if (authUser) {
            cvlUser.name = authUser?.name ? authUser.name : cvlUser.name
            cvlUser.displayName = cvlUser.name ? convertToTitleCase(cvlUser.name) : 'Unknown'
          }

          try {
            // Get the user's email, which may fail (unverified returns a 204) - catch and swallow the error
            const authEmail = await userService.getAuthUserEmail(res.locals.user.token)
            cvlUser.emailAddress = authEmail ? authEmail.email : ''
          } catch (error) {
            logger.info(`Email unverified in auth? - status ${error?.statusCode} for ${cvlUser.displayName}`)
          }

          setCurrentUserInSession(req, cvlUser)
          res.locals.user = { ...res.locals.user, ...cvlUser }
        } else {
          logger.info(`populateCurrentUser - session data for ${res.locals.user?.authSource} user is already present`)
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
