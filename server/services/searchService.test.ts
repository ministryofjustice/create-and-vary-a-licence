import LicenceApiClient from '../data/licenceApiClient'
import SearchService from './searchService'

jest.mock('../data/licenceApiClient')

describe('Search Service', () => {
  const licenceApiClient = new LicenceApiClient(null) as jest.Mocked<LicenceApiClient>
  const searchService = new SearchService(licenceApiClient)

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Probation Search', () => {
    it('calls Licence API client to search', async () => {
      await searchService.getProbationSearchResults('Test', 3000)
      expect(licenceApiClient.searchForOffenderOnStaffCaseload).toHaveBeenCalledWith({
        query: 'Test',
        staffIdentifier: 3000,
        sortBy: [],
      })
    })
  })

  describe('Case Admin Search', () => {
    it('calls Licence API client to search', async () => {
      await searchService.getCaSearchResults('Test', ['PRI'])
      expect(licenceApiClient.searchForOffenderOnPrisonCaseAdminCaseload).toHaveBeenCalledWith({
        query: 'Test',
        prisonCaseloads: ['PRI'],
      })
    })
  })

  describe('Prison Approver Search', () => {
    it('calls Licence API client to search', async () => {
      await searchService.getPrisonApproverSearchResults('Test', ['PRI'])
      expect(licenceApiClient.searchForOffenderOnApproverCaseload).toHaveBeenCalledWith({
        prisonCaseloads: ['PRI'],
        query: 'Test',
      })
    })
  })
})
