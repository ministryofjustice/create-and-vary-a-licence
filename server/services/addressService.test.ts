import { AddressResponse, AddressSearchResponse } from '../@types/licenceApiClientTypes'
import LicenceApiClient from '../data/licenceApiClient'
import AddressService from './addressService'
import { User } from '../@types/CvlUserDetails'

jest.mock('../data/licenceApiClient')

describe('AddressService', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const addressService = new AddressService(licenceApiClient) as jest.Mocked<AddressService>

  const user = {
    username: 'joebloggs',
    displayName: 'Joe Bloggs',
    deliusStaffIdentifier: 2000,
    firstName: 'Joe',
    lastName: 'Bloggs',
    emailAddress: 'jbloggs@probation.gov.uk',
  } as User

  describe('searchForAddresses', () => {
    afterEach(() => {
      jest.clearAllMocks()
    })

    it('should return an empty array if searchQuery is empty', async () => {
      const result = await addressService.searchForAddresses('', user)
      expect(result).toEqual([])
      expect(licenceApiClient.searchForAddresses).not.toHaveBeenCalled()
    })

    it('should call licenceApiClient with the correct searchQuery', async () => {
      const searchQuery = '123 Fake Street'
      const mockResponse = [{ firstLine: '123 Fake Street' }] as AddressSearchResponse[]
      licenceApiClient.searchForAddresses.mockResolvedValue(mockResponse)

      const result = await addressService.searchForAddresses(searchQuery, user)
      expect(licenceApiClient.searchForAddresses).toHaveBeenCalledWith({ searchQuery }, user)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('getPreferredAddresses', () => {
    it('should call licenceApiClient.getPreferredAddresses with the user and return the result', async () => {
      const mockResponse: AddressResponse[] = [
        {
          uprn: '123456789',
          reference: 'ref123',
          firstLine: '123 Test Street',
          secondLine: 'Test Area',
          townOrCity: 'Test City',
          county: 'Test County',
          postcode: 'TE1 2ST',
          source: 'OS_PLACES',
        },
      ]
      licenceApiClient.getPreferredAddresses.mockResolvedValue(mockResponse)

      const result = await addressService.getPreferredAddresses(user)

      expect(licenceApiClient.getPreferredAddresses).toHaveBeenCalledWith(user)
      expect(result).toEqual(mockResponse)
    })
  })

  describe('deleteAddressByReference', () => {
    it('should call licenceApiClient.deleteAddressByReference with reference and user', async () => {
      const reference = '550e8400-e29b-41d4-a716-446655440000'
      await addressService.deleteAddressByReference(reference, user)
      expect(licenceApiClient.deleteAddressByReference).toHaveBeenCalledWith(reference, user)
    })
  })
})
