import { Request, Response } from 'express'
import VaryApproverSearchRoutes from './varyApproverSearch'
import SearchService from '../../../services/searchService'
import { VaryApproverCase } from '../../../@types/licenceApiClientTypes'
import { User } from '../../../@types/CvlUserDetails'
import LicenceType from '../../../enumeration/licenceType'

const searchService = new SearchService(null) as jest.Mocked<SearchService>

jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Vary Approver Search', () => {
  const handler = new VaryApproverSearchRoutes(searchService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {} as Request

    res = {
      locals: {
        user: {
          probationPduCodes: ['PDU1', 'PDU2'],
          probationAreaCode: 'PA1',
        } as User,
      },
      render: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  const searchResponse = {
    pduCasesResponse: [
      {
        licenceId: 1,
        name: 'Test Person One',
        crnNumber: 'X12345',
        licenceType: LicenceType.AP,
        releaseDate: '01/05/2024',
        variationRequestDate: '03/06/2024',
        probationPractitioner: 'Com One',
      },
      {
        licenceId: 2,
        name: 'Test Person Two',
        crnNumber: 'X12346',
        licenceType: LicenceType.AP,
        releaseDate: '02/11/2022',
        variationRequestDate: '02/05/2024',
        probationPractitioner: 'Com Four',
      },
    ] as VaryApproverCase[],
    regionCasesResponse: [
      {
        licenceId: 1,
        name: 'Test Person One',
        crnNumber: 'X12345',
        licenceType: LicenceType.AP,
        releaseDate: '01/05/2024',
        variationRequestDate: '03/06/2024',
        probationPractitioner: 'Com One',
      },
      {
        licenceId: 2,
        name: 'Test Person Two',
        crnNumber: 'X12346',
        licenceType: LicenceType.AP,
        releaseDate: '02/11/2022',
        variationRequestDate: '02/05/2024',
        probationPractitioner: 'Com Four',
      },
      {
        licenceId: 3,
        name: 'Test Person Three',
        crnNumber: 'X12347',
        licenceType: LicenceType.AP,
        releaseDate: '01/05/2023',
        variationRequestDate: '01/08/2023',
        probationPractitioner: 'Com Four',
      },
    ] as VaryApproverCase[],
  }

  describe('GET', () => {
    it('sets the correct back link dependent on the previous page visited', async () => {
      req.query = { queryTerm: '' }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search/varyApproverSearch/varyApproverSearch', {
        queryTerm: '',
        backLink: '/licence/vary-approve/list',
        tabParameters: {
          activeTab: '#pdu-cases',
          pduCases: {
            tabId: 'tab-heading-pdu-cases',
            tabHeading: 'Cases in this PDU',
            resultsCount: 0,
          },
          regionCases: {
            tabId: 'tab-heading-region-cases',
            tabHeading: 'All cases in this region',
            resultsCount: 0,
          },
        },
        pduCases: [],
        regionCases: [],
      })
    })

    it('should render cases which match search query and set tab with most results as active', async () => {
      searchService.getVaryApproverSearchResults.mockResolvedValue(searchResponse)
      req.query = { queryTerm: 'test' }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search/varyApproverSearch/varyApproverSearch', {
        queryTerm: 'test',
        backLink: '/licence/vary-approve/list',
        tabParameters: {
          activeTab: '#region-cases',
          pduCases: {
            tabId: 'tab-heading-pdu-cases',
            tabHeading: 'Cases in this PDU',
            resultsCount: 2,
          },
          regionCases: {
            tabId: 'tab-heading-region-cases',
            tabHeading: 'All cases in this region',
            resultsCount: 3,
          },
        },
        pduCases: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
          {
            licenceId: 2,
            name: 'Test Person Two',
            crnNumber: 'X12346',
            licenceType: LicenceType.AP,
            releaseDate: '02/11/2022',
            variationRequestDate: '02/05/2024',
            probationPractitioner: 'Com Four',
          },
        ],
        regionCases: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
          {
            licenceId: 2,
            name: 'Test Person Two',
            crnNumber: 'X12346',
            licenceType: LicenceType.AP,
            releaseDate: '02/11/2022',
            variationRequestDate: '02/05/2024',
            probationPractitioner: 'Com Four',
          },
          {
            licenceId: 3,
            name: 'Test Person Three',
            crnNumber: 'X12347',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2023',
            variationRequestDate: '01/08/2023',
            probationPractitioner: 'Com Four',
          },
        ],
      })
    })

    it('should display the PDU cases tab as active if both tabs have the same number of search results', async () => {
      searchService.getVaryApproverSearchResults.mockResolvedValue({
        pduCasesResponse: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
        ] as VaryApproverCase[],
        regionCasesResponse: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
        ] as VaryApproverCase[],
      })
      req.query = { queryTerm: 'test person one' }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search/varyApproverSearch/varyApproverSearch', {
        queryTerm: 'test person one',
        backLink: '/licence/vary-approve/list',
        tabParameters: {
          activeTab: '#pdu-cases',
          pduCases: {
            tabId: 'tab-heading-pdu-cases',
            tabHeading: 'Cases in this PDU',
            resultsCount: 1,
          },
          regionCases: {
            tabId: 'tab-heading-region-cases',
            tabHeading: 'All cases in this region',
            resultsCount: 1,
          },
        },
        pduCases: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
        ],
        regionCases: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
        ],
      })
    })

    it('should trim the search query', async () => {
      const queryTerm = '   test query   '
      const trimmedQueryTerm = queryTerm.trim()

      searchService.getVaryApproverSearchResults.mockResolvedValue(searchResponse)
      req.query = { queryTerm }

      await handler.GET(req, res)

      expect(searchService.getVaryApproverSearchResults).toHaveBeenCalledWith(res.locals.user, queryTerm.trim())
      expect(res.render).toHaveBeenCalledWith('pages/search/varyApproverSearch/varyApproverSearch', {
        queryTerm: trimmedQueryTerm,
        backLink: '/licence/vary-approve/list',
        tabParameters: {
          activeTab: '#region-cases',
          pduCases: {
            tabId: 'tab-heading-pdu-cases',
            tabHeading: 'Cases in this PDU',
            resultsCount: 2,
          },
          regionCases: {
            tabId: 'tab-heading-region-cases',
            tabHeading: 'All cases in this region',
            resultsCount: 3,
          },
        },
        pduCases: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
          {
            licenceId: 2,
            name: 'Test Person Two',
            crnNumber: 'X12346',
            licenceType: LicenceType.AP,
            releaseDate: '02/11/2022',
            variationRequestDate: '02/05/2024',
            probationPractitioner: 'Com Four',
          },
        ],
        regionCases: [
          {
            licenceId: 1,
            name: 'Test Person One',
            crnNumber: 'X12345',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2024',
            variationRequestDate: '03/06/2024',
            probationPractitioner: 'Com One',
          },
          {
            licenceId: 2,
            name: 'Test Person Two',
            crnNumber: 'X12346',
            licenceType: LicenceType.AP,
            releaseDate: '02/11/2022',
            variationRequestDate: '02/05/2024',
            probationPractitioner: 'Com Four',
          },
          {
            licenceId: 3,
            name: 'Test Person Three',
            crnNumber: 'X12347',
            licenceType: LicenceType.AP,
            releaseDate: '01/05/2023',
            variationRequestDate: '01/08/2023',
            probationPractitioner: 'Com Four',
          },
        ],
      })
    })

    it('does not call the search service for a blank query', async () => {
      req.query = { queryTerm: '' }

      await handler.GET(req, res)

      expect(searchService.getVaryApproverSearchResults).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/varyApproverSearch/varyApproverSearch', {
        queryTerm: '',
        backLink: '/licence/vary-approve/list',
        tabParameters: {
          activeTab: '#pdu-cases',
          pduCases: {
            tabId: 'tab-heading-pdu-cases',
            tabHeading: 'Cases in this PDU',
            resultsCount: 0,
          },
          regionCases: {
            tabId: 'tab-heading-region-cases',
            tabHeading: 'All cases in this region',
            resultsCount: 0,
          },
        },
        pduCases: [],
        regionCases: [],
      })
    })
  })
})
