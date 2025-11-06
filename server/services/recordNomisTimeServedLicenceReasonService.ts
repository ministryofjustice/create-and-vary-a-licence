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

  async getNomisLicenceCreationReason(
    nomisId: string,
    bookingId: number,
    user: User,
  ): Promise<RecordNomisLicenceReasonResponse | null> {
    return this.licenceApiClient.getNomisLicenceCreationReason(nomisId, bookingId, user)
  }

  async updateNomisLicenceCreationReason(
    request: UpdateNomisLicenceReasonRequest,
    nomisId: string,
    bookingId: number,
    user: User,
  ): Promise<void> {
    return this.licenceApiClient.updateNomisLicenceCreationReason(request, nomisId, bookingId, user)
  }

  async deleteNomisLicenceCreationReason(nomisId: string, bookingId: number, user: User): Promise<void> {
    return this.licenceApiClient.deleteNomisLicenceCreationReason(nomisId, bookingId, user)
  }
}
