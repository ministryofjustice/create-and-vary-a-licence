import { Request, Response } from 'express'

import VaryApproveListRoutes from './varyApproveList'
import VaryApproverCaseloadService from '../../../services/lists/varyApproverCaseloadService'
import LicenceType from '../../../enumeration/licenceType'

const caseloadService = new VaryApproverCaseloadService(null) as jest.Mocked<VaryApproverCaseloadService>
jest.mock('../../../services/lists/varyApproverCaseloadService')

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

    caseloadService.getVaryApproverCaseload.mockResolvedValue([
      {
        licenceId: 1,
        name: 'Bob Smith',
        crnNumber: 'X12345',
        licenceType: LicenceType.AP,
        releaseDate: '01 May 2022',
        variationRequestDate: '01 May 2022',
        probationPractitioner: {
          staffCode: 'X1234',
          name: 'Com Four',
          allocated: true,
        },
        isLao: false,
      },
    ])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render list of variations for approval', async () => {
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
              staffCode: 'X1234',
              name: 'Com Four',
              allocated: true,
            },
          },
        ],
        regionCases: false,
        search: undefined,
      })
    })

    it('should successfully search by name', async () => {
      req.query.search = 'bob'

      await handler.GET(req, res)

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
              staffCode: 'X1234',
              name: 'Com Four',
              allocated: true,
            },
          },
        ],
        regionCases: false,
        search: 'bob',
      })
    })

    it('should successfully search by crn number', async () => {
      req.query.search = 'X12345'

      await handler.GET(req, res)

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
              staffCode: 'X1234',
              name: 'Com Four',
              allocated: true,
            },
          },
        ],
        regionCases: false,
        search: 'X12345',
      })
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.search = 'four'

      await handler.GET(req, res)

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
              staffCode: 'X1234',
              name: 'Com Four',
              allocated: true,
            },
          },
        ],
        regionCases: false,
        search: 'four',
      })
    })
  })
})
