import CvlUserDetails from '../CvlUserDetails'
import { DprReportDefinition } from '../dprReportingTypes'
import { LicenceConditionChange, Licence } from '../licenceApiClientTypes'

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
      uuid: string
    }

    type LocalsUser = User & CvlUserDetails

    interface Locals {
      user?: LocalsUser
      licence: Licence
      reportDefinitions: DprReportDefinition[]
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
