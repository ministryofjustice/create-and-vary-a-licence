import { User } from '../@types/CvlUserDetails'
import {
  ExternalTimeServedRecordRequest,
  ExternalTimeServedRecordResponse,
  type TimeServedProbationConfirmContactRequest,
} from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class TimeServedService {
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
  ): Promise<ExternalTimeServedRecordResponse | null> {
    return this.licenceApiClient.getTimeServedExternalRecord(nomisId, bookingId, user)
  }

  async addTimeServedProbationConfirmContact(
    licenceId: number,
    request: TimeServedProbationConfirmContactRequest,
    user: User,
  ): Promise<void> {
    await this.licenceApiClient.addTimeServedProbationConfirmContact(licenceId, request, user)
  }
}
