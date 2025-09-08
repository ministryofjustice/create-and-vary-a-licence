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

  describe('searchForAddresses', () => {
    const priorityString = 'Probation'

    it('should sort addresses based on priority string matches and alphanumeric', async () => {
      // Given
      const mockResponse: AddressSearchResponse[] = [
        makeAddress('1', 'Probation Services', 'Main Street', 'Townsville'), // match in first line
        makeAddress('2', 'Office Block', 'Hilltop', 'Village'), // no match
        makeAddress('3', 'Office Block', 'Hilltop', 'Village'), // duplicate to test orginal order preservation
        makeAddress('4', 'Liverpool Villa', 'Riverbank', 'Townsville'), // no match
        makeAddress('5', 'Probation Office Liverpool Complex'), // match in first line
        makeAddress('6', 'No Match House', 'Probation Liverpool Office Street'), // match in second line
        makeAddress('7', 'No Match House'), // no matches
        makeAddress('8', 'Liverpool Probation Office'), // match in first line
        makeAddress('9', 'Random Street'), // no matches
        makeAddress('10', 'Probation Barn'), // single match Probation
        makeAddress('11', 'Office Liverpool House'), // no match for single priority
        makeAddress('12', 'Probation Probation Probation'), // repeated match
      ]

      // When
      const results = await runSearch(mockResponse, priorityString)

      // Then
      expect(results).toEqual([
        '8', // matches 'Probation' (first line)
        '6', // matches 'Probation' (second line)
        '10', // matches 'Probation'
        '5', // matches 'Probation'
        '12', // matches 'Probation x 3'
        '1', // matches 'Probation'
        '4', // no match
        '7', // no match
        '2', // no match
        '3', // no match
        '11', // no match
        '9', // no match
      ])
    })

    it('should handle priority when no address results returnd ', async () => {
      // Given
      const addresses: AddressSearchResponse[] = []

      // When
      const results = await runSearch(addresses, priorityString)

      // Then
      expect(results).toHaveLength(0)
    })

    it('when no priority results should be in alphanumeric', async () => {
      // Given
      const mockResponse: AddressSearchResponse[] = [
        makeAddress('1', 'Probation Services', 'Main Street', 'Townsville'),
        makeAddress('2', 'Office Block', 'Hilltop', 'Village'),
        makeAddress('3', 'Office Block', 'Hilltop', 'Village'),
        makeAddress('4', 'Liverpool Villa', 'Riverbank', 'Townsville'),
        makeAddress('5', 'Probation Office Liverpool Complex'),
        makeAddress('6', 'No Match House', 'Probation Liverpool Office Street'),
        makeAddress('7', 'No Match House'),
        makeAddress('8', 'Liverpool Probation Office'),
        makeAddress('9', 'Random Street'),
        makeAddress('10', 'Probation Barn'),
        makeAddress('11', 'Office Liverpool House'),
        makeAddress('12', 'Probation Probation Probation'),
      ]

      // When
      const results = await runSearch(mockResponse)

      // Then
      expect(results).toEqual(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'])
    })

    const makeAddress = (
      uprn: string,
      firstLine: string,
      secondLine = '',
      townOrCity = 'City',
      county = 'Countyshire',
      postcode = 'AB1 2CD',
      country = 'UK',
    ): AddressSearchResponse => ({
      uprn,
      firstLine,
      secondLine,
      townOrCity,
      county,
      postcode,
      country,
    })

    const runSearch = async (addresses: AddressSearchResponse[], priorityString?: string): Promise<string[]> => {
      licenceApiClient.searchForAddresses.mockResolvedValue(addresses)
      const results = await addressService.searchForAddresses('test', user, priorityString)
      return results.map(r => r.uprn)
    }
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
