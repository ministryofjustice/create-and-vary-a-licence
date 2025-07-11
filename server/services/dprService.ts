import { User } from '../@types/CvlUserDetails'
import { DprReportDefinition } from '../@types/dprReportingTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class DprService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async getDefinitions(user?: User): Promise<DprReportDefinition[]> {
    return this.licenceApiClient.getDprReportDefinitions(user)
  }
}
