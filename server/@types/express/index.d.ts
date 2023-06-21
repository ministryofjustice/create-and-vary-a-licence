import CvlUserDetails from '../CvlUserDetails'
import { LicenceConditionChange } from '../licenceApiClientTypes'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    returnToCase: string
    nowInMinutes: number
    currentUser: CvlUserDetails
    caseloadsSelected: string[]
    teamSelection: string[]
    changedConditions: LicenceConditionChange[]
    changedConditionsCounter: number
    changedConditionsInputs: string[]
    changedConditionsInputsCounter: number
  }
}

export declare global {
  namespace Express {
    interface User {
      username: string
      token: string
      authSource: string
      userRoles: string[]
    }

    type LocalsUser = User & CvlUserDetails

    interface Locals {
      user?: LocalsUser
    }

    interface Request {
      verified?: boolean

      id: string
    }

    interface Response {
      internalRedirect(url: string): void
      renderPDF(view: string, pageData: Record<string, unknown>, options: Record<string, unknown>): void
    }
  }
}
