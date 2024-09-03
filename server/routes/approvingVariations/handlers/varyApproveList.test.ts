import { Request, Response } from 'express'

import VaryApproveListRoutes from './varyApproveList'
import CaseloadService from '../../../services/lists/caseloadService'
import LicenceType from '../../../enumeration/licenceType'

const caseloadService = new CaseloadService(null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/lists/caseloadService')

const aCase = {
  licenceId: 1,
  licenceType: LicenceType.AP,
  variationRequestDate: '01 May 2022',
  releaseDate: '01 May 2022',
  name: 'Bob Smith',
  crnNumber: 'X12345',
  probationPractitioner: {
    name: 'Walter White',
  },
}

describe('Route Handlers - Variation approval list', () => {
  const handler = new VaryApproveListRoutes(caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      locals: {
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render list of variations for approval', async () => {
      caseloadService.getVaryApproverCaseload.mockResolvedValue([aCase])

      await handler.GET(req, res)
      expect(caseloadService.getVaryApproverCaseload).toHaveBeenCalledWith(res.locals.user, undefined)
      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/cases', {
        caseload: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            licenceType: 'AP',
            releaseDate: '01 May 2022',
            variationRequestDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        regionCases: false,
        search: undefined,
      })
    })

    it('should render list of variations for region for approval', async () => {
      req.query.view = 'region'
      caseloadService.getVaryApproverCaseloadByRegion.mockResolvedValue([aCase])

      await handler.GET(req, res)
      expect(caseloadService.getVaryApproverCaseloadByRegion).toHaveBeenCalledWith(res.locals.user, undefined)
      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/cases', {
        caseload: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            licenceType: 'AP',
            releaseDate: '01 May 2022',
            variationRequestDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        regionCases: true,
        search: undefined,
      })
    })

    it('should pass search request through for approval search', async () => {
      req.query.search = 'bob'
      await handler.GET(req, res)
      expect(caseloadService.getVaryApproverCaseload).toHaveBeenCalledWith(res.locals.user, 'bob')
    })

    it('should pass search request through for approval region search', async () => {
      req.query.view = 'region'
      req.query.search = 'bob'
      await handler.GET(req, res)
      expect(caseloadService.getVaryApproverCaseloadByRegion).toHaveBeenCalledWith(res.locals.user, 'bob')
    })
  })
})
