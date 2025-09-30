import { Request, Response } from 'express'
import VaryApproverSearchRoutes from './varyApproverSearch'
import SearchService from '../../../services/searchService'

const searchService = new SearchService(null) as jest.Mocked<SearchService>

jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Prison Vary Approver Search', () => {
  const handler = new VaryApproverSearchRoutes(searchService)
  let req: Request
  let res: Response

  const tabParameters = {
    pduCases: {
      tabId: 'tab-heading-pdu-cases',
    },
    regionCases: {
      tabId: 'tab-heading-region-cases',
    },
  }

  beforeEach(() => {
    req = {} as Request

    res = {
      locals: {
        user: {},
      },
      render: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () =>
    it('sets the correct back link dependent on the previous page visited', async () => {
      req.query = { queryTerm: '' }

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/search/varyApproverSearch/varyApproverSearch', {
        queryTerm: '',
        backLink: '/licence/vary-approve/list',
        tabParameters,
      })
    }))
})
