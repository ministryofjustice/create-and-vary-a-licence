import { Request, Response } from 'express'

import VaryApproveListRoutes from './varyApproveList'
import CaseloadService from '../../../services/caseloadService'
import LicenceStatus from '../../../enumeration/licenceStatus'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

const username = 'joebloggs'

describe('Route Handlers - Variation approval list', () => {
  const handler = new VaryApproveListRoutes(caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
      query: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      locals: {
        user: {
          username,
          probationPduCodes: ['A', 'B'],
        },
      },
    } as unknown as Response

    caseloadService.getVaryApproverCaseload.mockResolvedValue([
      {
        licenceId: 1,
        licenceType: 'AP',
        surname: 'Smith',
        forename: 'Bob',
        crn: 'X111',
        nomisId: 'A1234AA',
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        prisonDescription: 'Moorland (HMP)',
        actualReleaseDate: '01/05/2022',
        comFirstName: 'Stephen',
        comLastName: 'Mills',
      },
      {
        licenceId: 2,
        licenceType: 'AP',
        surname: 'Baker',
        forename: 'Matthew',
        crn: 'X222',
        nomisId: 'A1234AB',
        licenceStatus: LicenceStatus.VARIATION_SUBMITTED,
        prisonDescription: 'Moorland (HMP)',
        actualReleaseDate: '01/05/2022',
        comFirstName: 'Stephen',
        comLastName: 'Hawking',
      },
    ])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should render list of variations for approval', async () => {
      await handler.GET(req, res)
      expect(caseloadService.getVaryApproverCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(res.render).toHaveBeenCalledWith('pages/vary-approve/cases', {
        caseload: [
          {
            licenceId: 1,
            licenceType: 'AP',
            name: 'Bob Smith',
            crnNumber: 'X111',
            releaseDate: '01 May 2022',
            probationPractitioner: 'Stephen Mills',
          },
          {
            licenceId: 2,
            licenceType: 'AP',
            name: 'Matthew Baker',
            crnNumber: 'X222',
            releaseDate: '01 May 2022',
            probationPractitioner: 'Stephen Hawking',
          },
        ],
      })
    })
  })
})
