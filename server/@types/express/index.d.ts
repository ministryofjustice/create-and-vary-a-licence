import { components } from '@ministryofjustice/hmpps-digital-prison-reporting-frontend/dpr/types/api'
import { CvlUserDetails } from '../CvlUserDetails'
import { LicenceConditionChange, Licence } from '../licenceApiClientTypes'

type ReportDefinitionSummary = components['schemas']['ReportDefinitionSummary']

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

declare global {
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
      definitions?: ReportDefinitionSummary[]
    }

    interface Request {
      verified?: boolean

      id: string
    }

    interface Response {
      locals: Locals
      internalRedirect(url: string): void
      renderPDF(view: string, pageData: Record<string, unknown>, options: Record<string, unknown>): void
    }
  }
}
