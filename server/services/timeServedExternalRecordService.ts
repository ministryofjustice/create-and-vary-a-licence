import { User } from '../@types/CvlUserDetails'
import { ExternalTimeServedRecordRequest, TimeServedExternalRecordsResponse } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class TimeServedExternalRecordService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async updateTimeServedExternalRecord(
    nomisId: string,
    bookingId: number,
    request: ExternalTimeServedRecordRequest,
    user: User,
  ): Promise<void> {
    return this.licenceApiClient.updateTimeServedExternalRecord(nomisId, bookingId, request, user)
  }

  async getTimeServedExternalRecord(
    nomisId: string,
    bookingId: number,
    user: User,
  ): Promise<TimeServedExternalRecordsResponse | null> {
    return this.licenceApiClient.getTimeServedExternalRecord(nomisId, bookingId, user)
  }
}
