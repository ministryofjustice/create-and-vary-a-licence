import { Request, Response } from 'express'

import ApprovalCaseRoutes from './approvalCases'
import CaseloadService from '../../../services/caseloadService'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

describe('Route Handlers - Approval - case list', () => {
  const handler = new ApprovalCaseRoutes(caseloadService)
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

    caseloadService.getApproverCaseload.mockResolvedValue([
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.SUBMITTED,
          },
        ],
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
    ])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render list of licences for approval', async () => {
      await handler.GET(req, res)
      expect(caseloadService.getApproverCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
      })
    })

    it('should successfully search by name', async () => {
      req.query.search = 'bob'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        search: 'bob',
      })
    })

    it('should successfully search by prison number', async () => {
      req.query.search = 'A1234AA'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        search: 'A1234AA',
      })
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.search = 'white'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        search: 'white',
      })
    })

    it('should return empty caseload if search does not match', async () => {
      req.query.search = 'XXX'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/approve/cases', {
        cases: [],
        search: 'XXX',
      })
    })
  })
})
