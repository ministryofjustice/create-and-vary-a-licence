import { User } from '../@types/CvlUserDetails'
import TimeServedService from './timeServedService'
import LicenceApiClient from '../data/licenceApiClient'
import { ExternalTimeServedRecordRequest, ExternalTimeServedRecordResponse } from '../@types/licenceApiClientTypes'

jest.mock('../data/licenceApiClient')

describe('TimeServedExternalRecordService', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const service = new TimeServedService(licenceApiClient)

  const user = { username: 'joebloggs' } as User
  const nomisId = 'A1234BC'
  const bookingId = 12345
  const reason = 'Test reason for using NOMIS'
  const prisonCode = 'MDI'

  beforeEach(() => {
    jest.resetAllMocks()
  })

  describe('updateTimeServedExternalRecord', () => {
    it('should call licenceApiClient with correct parameters', async () => {
      const request: ExternalTimeServedRecordRequest = {
        reason,
        prisonCode,
      }
      await service.updateTimeServedExternalRecord(nomisId, bookingId, request, user)

      expect(licenceApiClient.updateTimeServedExternalRecord).toHaveBeenCalledWith(nomisId, bookingId, request, user)
      expect(licenceApiClient.updateTimeServedExternalRecord).toHaveBeenCalledTimes(1)
    })

    it('Propagates any errors', async () => {
      const request: ExternalTimeServedRecordRequest = {
        reason,
        prisonCode,
      }

      const error = new Error('error')
      licenceApiClient.updateTimeServedExternalRecord.mockRejectedValue(error)

      await expect(service.updateTimeServedExternalRecord(nomisId, bookingId, request, user)).rejects.toThrow('error')
      expect(licenceApiClient.updateTimeServedExternalRecord).toHaveBeenCalledWith(nomisId, bookingId, request, user)
    })
  })

  describe('getTimeServedExternalRecord', () => {
    it('should call licenceApiClient with correct parameters', async () => {
      const response: ExternalTimeServedRecordResponse = {
        nomsId: nomisId,
        bookingId,
        reason,
        prisonCode,
        dateCreated: '2024-07-01T10:00:00Z',
        dateLastUpdated: '2024-07-01T10:00:00Z',
      }
      licenceApiClient.getTimeServedExternalRecord.mockResolvedValue(response)

      const result = await service.getTimeServedExternalRecord(nomisId, bookingId, user)

      expect(licenceApiClient.getTimeServedExternalRecord).toHaveBeenCalledWith(nomisId, bookingId, user)
      expect(licenceApiClient.getTimeServedExternalRecord).toHaveBeenCalledTimes(1)
      expect(result).toEqual(response)
    })

    it('Propagates any errors', async () => {
      const error = new Error('some error')
      licenceApiClient.getTimeServedExternalRecord.mockRejectedValue(error)
      await expect(() => service.getTimeServedExternalRecord(nomisId, bookingId, user)).rejects.toThrow('some error')
      expect(licenceApiClient.getTimeServedExternalRecord).toHaveBeenCalled()
    })
  })
})
