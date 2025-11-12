import { User } from '../@types/CvlUserDetails'
import {
  RecordNomisLicenceReasonRequest,
  RecordNomisLicenceReasonResponse,
  UpdateNomisLicenceReasonRequest,
} from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'

export default class RecordNomisTimeServedLicenceReasonService {
  constructor(private readonly licenceApiClient: LicenceApiClient) {}

  async recordNomisLicenceCreationReason(request: RecordNomisLicenceReasonRequest, user: User): Promise<void> {
    return this.licenceApiClient.recordNomisLicenceCreationReason(request, user)
  }

  async getExistingNomisLicenceCreationReason(
    nomisId: string,
    bookingId: number,
    user: User,
  ): Promise<RecordNomisLicenceReasonResponse | null> {
    return this.licenceApiClient.getExistingNomisLicenceCreationReason(nomisId, bookingId, user)
  }

  async updateNomisLicenceCreationReason(
    nomisId: string,
    bookingId: number,
    request: UpdateNomisLicenceReasonRequest,
    user: User,
  ): Promise<void> {
    return this.licenceApiClient.updateNomisLicenceCreationReason(nomisId, bookingId, request, user)
  }
}
