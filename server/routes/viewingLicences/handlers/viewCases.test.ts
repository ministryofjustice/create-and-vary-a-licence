import { Request, Response } from 'express'

import _ from 'lodash'
import moment from 'moment'
import ViewAndPrintCaseRoutes from './viewCases'
import LicenceStatus from '../../../enumeration/licenceStatus'
import statusConfig from '../../../licences/licenceStatus'
import CaseloadService from '../../../services/caseloadService'
import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { convertToTitleCase } from '../../../utils/utils'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>
jest.mock('../../../services/caseloadService')

describe('Route handlers - View and print case list', () => {
  const handler = new ViewAndPrintCaseRoutes(caseloadService)
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

    caseloadService.getOmuCaseload.mockResolvedValue([
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
          name: 'Sherlock Holmes',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.NOT_STARTED,
          },
        ],
        nomisRecord: {
          firstName: 'Joe',
          lastName: 'Bloggs',
          prisonerNumber: 'A1234AB',
          conditionalReleaseDate: '2022-05-01',
        } as Prisoner,
        probationPractitioner: {
          name: 'Thor',
        },
      },
      {
        licences: [
          {
            type: LicenceType.AP,
            status: LicenceStatus.NOT_IN_PILOT,
          },
        ],
        nomisRecord: {
          firstName: 'Harvey',
          lastName: 'Smith',
          prisonerNumber: 'A1234AC',
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
    it('should render list of licences', async () => {
      await handler.GET(req, res)

      expect(caseloadService.getOmuCaseload).toHaveBeenCalledWith({ username: 'joebloggs' })
      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
          {
            name: 'Joe Bloggs',
            prisonerNumber: 'A1234AB',
            probationPractitioner: {
              name: 'Thor',
            },
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.NOT_STARTED,
            isClickable: false,
          },
          {
            name: 'Harvey Smith',
            prisonerNumber: 'A1234AC',
            probationPractitioner: {
              name: 'Walter White',
            },
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            isClickable: false,
          },
        ],
        statusConfig,
      })
    })

    it('should successfully search by name', async () => {
      req.query.search = 'bob'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
        ],
        search: 'bob',
        statusConfig,
      })
    })

    it('should successfully search by prison number', async () => {
      req.query.search = 'A1234AA'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
        ],
        search: 'A1234AA',
        statusConfig,
      })
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.search = 'holmes'

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/view/cases', {
        cases: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            prisonerNumber: 'A1234AA',
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.SUBMITTED,
            isClickable: true,
          },
        ],
        search: 'holmes',
        statusConfig,
      })
    })
  })
})
