import { DprReportDefinition } from '../@types/dprReportingTypes'
import { SignedWithMethod } from '../data/hmppsRestClient'
import LicenceApiClient from '../data/licenceApiClient'

export default class DprService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getDefinitions(user?: SignedWithMethod): Promise<DprReportDefinition[]> {
    return this.licenceApiClient.getDprReportDefinitions(user)
  }
}
