import { User } from '../@types/CvlUserDetails'
import { RecordNomisLicenceReasonRequest } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class RecordNomisTimeServedLicenceReasonService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async recordNomisLicenceCreationReason(request: RecordNomisLicenceReasonRequest, user: User): Promise<void> {
    return this.licenceApiClient.recordNomisLicenceCreationReason(request, user)
  }
}
