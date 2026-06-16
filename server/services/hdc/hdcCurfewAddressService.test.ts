import LicenceApiClient from '../../data/licenceApiClient'
import { User } from '../../@types/CvlUserDetails'
import HdcCurfewAddressService from './hdcCurfewAddressService'
import CurfewAccommodationType from '../../enumeration/curfewAccommodationType'
import { AddAddressRequest, AddHdcCurfewAddressRequest, Licence } from '../../@types/licenceApiClientTypes'

jest.mock('../../data/licenceApiClient')

describe('HDC Curfew Address Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const hdcCurfewAddressService = new HdcCurfewAddressService(licenceApiClient)
  const user = { username: 'joebloggs' } as User

  describe('updateHdcCurfewAddress', () => {
    const licenceId = 123
    const address = {
      uprn: '123456',
      firstLine: 'firstLine',
      secondLine: 'secondLine',
      townOrCity: 'townOrCity',
      county: 'county',
      postcode: 'postcode',
      source: 'OS_PLACES',
    } as AddAddressRequest
    const request: AddHdcCurfewAddressRequest = {
      address,
      accommodationType: CurfewAccommodationType.RESIDENTIAL,
      postReleaseResidentialChecksCompleted: false,
      postReleaseResidentialChecksNotCompletedReason: 'reason',
    }

    it('should call to update the HDC curfew address', async () => {
      await hdcCurfewAddressService.updateHdcCurfewAddress(licenceId, request, user)
      expect(licenceApiClient.updateHdcCurfewAddress).toHaveBeenCalledWith(licenceId, request, user)
    })
  })

  describe('updateResidentialChecks', () => {
    it('should map values and call updateHdcCurfewAddress', async () => {
      const licence = {
        id: 123,
        kind: 'HDC',
        curfewAddress: {
          accommodationType: CurfewAccommodationType.RESIDENTIAL,
        },
      } as Licence

      const completed = true
      const reason = 'not applicable'

      await hdcCurfewAddressService.updateResidentialChecks(licence, completed, reason, user)

      expect(licenceApiClient.updateHdcCurfewAddress).toHaveBeenCalledWith(
        123,
        {
          accommodationType: CurfewAccommodationType.RESIDENTIAL,
          postReleaseResidentialChecksCompleted: true,
          postReleaseResidentialChecksNotCompletedReason: 'not applicable',
        },
        user,
      )
    })
  })
})
