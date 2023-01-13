import CvlUserDetails from '../CvlUserDetails'
import { LicenceConditionChange } from '../licenceApiClientTypes'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
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

    interface Request {
      verified?: boolean
    }

    interface Response {
      internalRedirect(url: string): void
      renderPDF(view: string, pageData: Record<string, unknown>, options: Record<string, unknown>): void
    }
  }
}
