import { User } from '../../@types/CvlUserDetails'
import type { CaCaseLoad } from '../../@types/licenceApiClientTypes'

import LicenceApiClient from '../../data/licenceApiClient'

export default class CaCaseloadService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  public async getPrisonOmuCaseload(user: User, prisonCodes: string[], searchString?: string): Promise<CaCaseLoad> {
    return this.licenceApiClient.getPrisonOmuCaseload({ prisonCodes, searchString }, user)
  }

  public async getProbationOmuCaseload(user: User, prisonCodes: string[], searchString?: string): Promise<CaCaseLoad> {
    return this.licenceApiClient.getProbationOmuCaseload({ prisonCodes, searchString }, user)
  }
}
