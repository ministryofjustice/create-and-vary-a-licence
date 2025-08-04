import { Request, Response } from 'express'
import ApproverSearchRoutes from './approverSearch'
import SearchService from '../../../services/searchService'

const searchService = new SearchService(null) as jest.Mocked<SearchService>

jest.mock('../../../services/searchService')

describe('Route Handlers - Search - Prison Approver Search', () => {
  const handler = new ApproverSearchRoutes(searchService)
  let req: Request
  let res: Response

  const tabParameters = {
    approvalNeeded: {
      tabId: 'tab-heading-approval-needed',
    },
    recentlyApproved: {
      tabId: 'tab-heading-recently-approved',
    },
  }

  beforeEach(() => {
    req = {} as Request

    res = {
      locals: {
        user: {
          deliusStaffIdentifier: 3000,
        },
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

      expect(res.render).toHaveBeenCalledWith('pages/search/approverSearch/approverSearch', {
        queryTerm: '',
        backLink: '/licence/approve/cases',
        tabParameters,
      })
    }))
})
