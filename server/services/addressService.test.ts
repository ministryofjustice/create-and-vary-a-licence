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
    const priorityStrings = ['Probation', 'Office', 'Liverpool']

    it('should sort addresses based on priority string matches in order and preserve original order within groups', async () => {
      // Given
      const mockResponse: AddressSearchResponse[] = [
        makeAddress('1', 'Probation Services', 'Main Street', 'Townsville'),
        makeAddress('2', 'Office Block', 'Hilltop', 'Village'),
        makeAddress('3', 'Office Block', 'Hilltop', 'Village'), // duplicate to test stability
        makeAddress('4', 'Liverpool Villa', 'Riverbank', 'Townsville'),
        makeAddress('5', 'Probation Office Liverpool Complex'),
        makeAddress('6', 'No Match House', 'Probation Liverpool Office Street'),
        makeAddress('7', 'No Match House'), // no matches
        makeAddress('8', 'Liverpool Probation Office'),
        makeAddress('9', 'Random Street'), // no matches
        makeAddress('10', 'Probation Barn'), // single match Probation
        makeAddress('11', 'Office Liverpool House'), // two matches
        makeAddress('12', 'Probation Probation Probation'), // repeated match
      ]

      // When
      const results = await runSearch(mockResponse, priorityStrings)

      // Then
      expect(results).toEqual([
        '5', // matches all 3 priorities in address order
        '6', // matches all 3, different address order
        '8', // matches all 3, different address order
        '11', // matches 2 priorities: Office + Liverpool
        '1', // single match: Probation
        '10', // single match: Probation
        '12', // repeated Probation (counted once)
        '2', // single match: Office
        '3', // single match: Office, preserves input order after '2'
        '4', // single match: Liverpool
        '7', // no matches
        '9', // no matches
      ])
    })

    it('should sort addresses based on given initial order with in priority order', async () => {
      // Given
      const mockResponse: AddressSearchResponse[] = [
        makeAddress('1', 'Liverpool Services 1', 'Main Street', 'Townsville'),
        makeAddress('2', 'Probation Services 2', 'Main Street', 'Townsville'),
        makeAddress('3', 'Probation Services 3', 'Main Street', 'Townsville'),
        makeAddress('4', 'Probation Services 4', 'Main Street', 'Townsville'),
        makeAddress('5', 'Probation Office Services 5', 'Main Street', 'Townsville'),
      ]

      // When
      const results = await runSearch(mockResponse, priorityStrings)

      // Then
      expect(results).toEqual(['5', '2', '3', '4', '1'])
    })

    it('should count priority count over alphabetical order', async () => {
      // Given
      const addresses = [
        makeAddress('21', 'Office Probation Street'),
        makeAddress('20', 'Liverpool Office Probation Street'),
      ]

      // When
      const results = await runSearch(addresses, priorityStrings)

      // Then
      // "Liverpool Office Probation" is now highest priority over Office Probation as there is more matches
      expect(results).toEqual(['20', '21'])
    })

    it('should fall back to original order when no priorities are matched', async () => {
      // Given
      const addresses = [makeAddress('30', 'No match here'), makeAddress('31', 'Still no match')]

      // When
      const results = await runSearch(addresses, priorityStrings)

      // Then
      expect(results).toEqual(['30', '31'])
    })

    it('should handle a single exact priority match correctly', async () => {
      // Given
      const addresses = [makeAddress('40', 'No match street'), makeAddress('41', 'Probation Street')]
      const priorityStrings = ['Probation']

      // When
      const results = await runSearch(addresses, priorityStrings)

      // Then
      expect(results).toEqual(['41', '40'])
    })
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

  const runSearch = async (addresses: AddressSearchResponse[], priorityStrings: string[]): Promise<string[]> => {
    licenceApiClient.searchForAddresses.mockResolvedValue(addresses)
    const result = await addressService.searchForAddresses('test', user, priorityStrings)
    return result.map(r => r.uprn)
  }

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
