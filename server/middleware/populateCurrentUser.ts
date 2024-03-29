import { RequestHandler } from 'express'
import logger from '../../logger'
import { convertToTitleCase, removeDuplicates } from '../utils/utils'
import CvlUserDetails from '../@types/CvlUserDetails'
import config from '../config'
import LicenceService from '../services/licenceService'
import UserService from '../services/userService'

/**
 * This middleware checks whether a token is present and if user information is populated in the session.
 * If no user information is present it will populate values into req.session.currentUser based on the
 * auth_source (nomis, delius or other) and persists these in the user's session information and Redis
 * in the key 'currentUser', and is also merged into res.locals.user.
 *
 * If user information is already present in this session it is merged into res.locals.users for use in
 * subsequent handlers.
 *
 * Passport already stores some user information (token, username, authSource and userRoles) into the
 * session during authentication, and this is also visible in Redis in the 'passport' key, and in
 * req.user and res.locals.user.
 *
 * @param userService
 * @param licenceService
 */

export default function populateCurrentUser(userService: UserService, licenceService: LicenceService): RequestHandler {
  return async (req, res, next) => {
    try {
      // Populate the currentUser details in the session if there is a token present and no user details
      if (res.locals.user?.token) {
        const { user } = res.locals
        if (!req.session?.currentUser) {
          const cvlUser = new CvlUserDetails()

          if (user.authSource === 'nomis') {
            // Assemble user information from Nomis via prison API
            const [prisonUser, prisonUserCaseload] = await Promise.all([
              userService.getPrisonUser(user),
              userService.getPrisonUserCaseloads(user),
            ])

            cvlUser.firstName = prisonUser.firstName
            cvlUser.lastName = prisonUser.lastName
            cvlUser.displayName = convertToTitleCase(`${prisonUser.firstName} ${prisonUser.lastName}`)
            cvlUser.activeCaseload = prisonUser.activeCaseLoadId
            cvlUser.nomisStaffId = prisonUser.staffId
            cvlUser.prisonCaseload = removeDuplicates(prisonUserCaseload.map(cs => cs.caseLoadId))

            logger.info(
              `Prison user session : username ${prisonUser?.username} name ${cvlUser?.displayName} caseload ${cvlUser?.prisonCaseload}`
            )

            const { email } = await userService.getUserEmail(user)
            await licenceService.updatePrisonUserDetails({
              staffUsername: prisonUser.username,
              staffEmail: email,
              firstName: prisonUser.firstName,
              lastName: prisonUser.lastName,
            })
          } else if (user.authSource === 'delius') {
            // Assemble user information from Delius via community API
            const probationUser = await userService.getProbationUser(user)

            cvlUser.firstName = probationUser?.staff?.forenames
            cvlUser.lastName = probationUser?.staff?.surname
            cvlUser.displayName = convertToTitleCase(
              `${probationUser?.staff?.forenames} ${probationUser?.staff?.surname}`
            )
            cvlUser.deliusStaffIdentifier = probationUser?.staffIdentifier
            cvlUser.deliusStaffCode = probationUser?.staffCode
            cvlUser.emailAddress = probationUser?.email
            cvlUser.telephoneNumber = probationUser?.telephoneNumber
            cvlUser.probationAreaCode = probationUser?.probationArea?.code
            cvlUser.probationAreaDescription = probationUser?.probationArea?.description
            cvlUser.probationPduCodes = probationUser?.teams?.map(team => team?.borough?.code)
            cvlUser.probationLauCodes = probationUser?.teams?.map(team => team?.district?.code)
            cvlUser.probationTeamCodes = probationUser?.teams?.map(team => team?.code)
            cvlUser.probationTeams = probationUser?.teams
              .map(team => ({ code: team.code, label: team.description }))
              .sort((a, b) => (a.label > b.label ? 1 : -1))

            logger.info(
              `Probation user session : username ${user?.username} name ${cvlUser?.displayName} area ${cvlUser?.probationAreaCode} teams ${cvlUser?.probationTeamCodes}`
            )

            await licenceService.updateComDetails({
              staffIdentifier: probationUser?.staffIdentifier,
              staffUsername: user.username,
              staffEmail: probationUser?.email,
              firstName: probationUser?.staff?.forenames,
              lastName: probationUser?.staff?.surname,
            })
          } else {
            // Assemble basic user information from hmpps-auth
            const authUser = await userService.getUser(user)
            if (authUser) {
              cvlUser.displayName = convertToTitleCase(authUser?.name)
            }

            logger.info(`Auth user session : username ${user?.username} name ${cvlUser?.displayName}`)
          }

          // If there is no user email from Delius already try and get one from hmpps-auth
          if (!cvlUser?.emailAddress) {
            try {
              // Get the user's email, which may fail (unverified returns a 204) - catch and swallow the error
              const authEmail = await userService.getUserEmail(user)
              cvlUser.emailAddress = authEmail ? authEmail.email : null
              logger.info(`Auth user email : username ${user?.username} email ${authEmail?.email}`)
            } catch (error) {
              logger.info(`Email unverified in auth? - status ${error?.statusCode} for ${cvlUser?.displayName}`)
            }
          }

          // Configure whether to use QR codes on licences produced by this user
          res.locals.qrCodesEnabled = config.qrCodesEnabled

          // Setup the user's session and res.locals
          req.session.currentUser = cvlUser
          res.locals.user = { ...res.locals.user, ...cvlUser }
        } else {
          res.locals.user = { ...res.locals.user, ...req.session.currentUser }
        }
      }
      res.locals.isPrisonUser = res.locals.user.authSource === 'nomis'
      next()
    } catch (error) {
      logger.error(error, `Failed to get user details for: ${res.locals.user?.username}`)
      next(error)
    }
  }
}
