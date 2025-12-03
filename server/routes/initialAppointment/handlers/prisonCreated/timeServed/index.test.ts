import { getTimeServedEditPath } from './index'
import { Licence } from '../../../../../@types/licenceApiClientTypes'
import { getTimeServerContactProbation } from '../../../../creatingLicences/handlers/prisonCreated/timeServed/contactProbationTeamRoutes'

describe('Time served path helpers', () => {
  describe('getTimeServedEditPath', () => {
    it('should return check-your-answers path when licence status is IN_PROGRESS', () => {
      // Given
      const licence: Licence = {
        id: '123',
        statusCode: 'IN_PROGRESS',
      } as Licence

      // When
      const result = getTimeServedEditPath(licence)

      // Then
      expect(result).toBe(`/licence/time-served/id/${licence.id}/check-your-answers`)
    })

    it('should return check-your-answers path when licence status is not IN_PROGRESS', () => {
      // Given
      const licence: Licence = {
        id: '456',
        statusCode: 'APPROVED',
      } as Licence

      // When
      const result = getTimeServedEditPath(licence)

      // Then
      expect(result).toBe(`/licence/time-served/id/${licence.id}/check-your-answers`)
    })
  })

  describe('getTimeServerContactProbation', () => {
    it('should return correct contact-probation-team path', () => {
      // Given
      const licenceId = '789'

      // When
      const result = getTimeServerContactProbation(licenceId)

      // Then
      expect(result).toBe(`/licence/time-served/create/id/${licenceId}/contact-probation-team`)
    })
  })
})
