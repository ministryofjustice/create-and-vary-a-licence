import { User } from '../@types/CvlUserDetails'
import RecordNomisTimeServedLicenceReasonService from './recordNomisTimeServedLicenceReasonService'
import LicenceApiClient from '../data/licenceApiClient'
import { RecordNomisLicenceReasonRequest } from '../@types/licenceApiClientTypes'

jest.mock('../data/licenceApiClient')

describe('RecordNomisTimeServedLicenceReasonService', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const service = new RecordNomisTimeServedLicenceReasonService(licenceApiClient)

  const user = { username: 'joebloggs' } as User

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('recordNomisLicenceCreationReason', () => {
    it('should call licenceApiClient with correct parameters', async () => {
      const request: RecordNomisLicenceReasonRequest = {
        nomsId: 'A1234BC',
        bookingId: 12345,
        reason: 'Test reason for using NOMIS',
        prisonCode: 'MDI',
      }
      await service.recordNomisLicenceCreationReason(request, user)

      expect(licenceApiClient.recordNomisLicenceCreationReason).toHaveBeenCalledWith(request, user)
      expect(licenceApiClient.recordNomisLicenceCreationReason).toHaveBeenCalledTimes(1)
    })

    it('should handle errors from the licenceApiClient', async () => {
      const request: RecordNomisLicenceReasonRequest = {
        nomsId: 'A1234BC',
        bookingId: 12345,
        reason: 'Test reason',
        prisonCode: 'MDI',
      }

      const error = new Error('error')
      licenceApiClient.recordNomisLicenceCreationReason.mockRejectedValue(error)

      await expect(service.recordNomisLicenceCreationReason(request, user)).rejects.toThrow('error')
      expect(licenceApiClient.recordNomisLicenceCreationReason).toHaveBeenCalledWith(request, user)
    })
  })
})
