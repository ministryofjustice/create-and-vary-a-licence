import { User } from '../../@types/CvlUserDetails'
import { CaCase, TimeServedCaseload } from '../../@types/licenceApiClientTypes'

import LicenceApiClient from '../../data/licenceApiClient'

export default class CaCaseloadService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  public async getPrisonOmuCaseload(user: User, prisonCodes: string[], searchString?: string): Promise<CaCase[]> {
    return this.licenceApiClient.getPrisonOmuCaseload({ prisonCodes, searchString }, user)
  }

  public async getProbationOmuCaseload(user: User, prisonCodes: string[], searchString?: string): Promise<CaCase[]> {
    return this.licenceApiClient.getProbationOmuCaseload({ prisonCodes, searchString }, user)
  }

  public async getTimeServedCases(user: User, prisonCode: string): Promise<TimeServedCaseload> {
    return this.licenceApiClient.getTimeServedCases(prisonCode, user)
  }
}
