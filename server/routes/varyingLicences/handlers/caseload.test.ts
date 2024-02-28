import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import { Prisoner } from '../../../@types/prisonerSearchApiClientTypes'
import { DeliusRecord } from '../../../@types/managedCase'

const caseloadService = new CaseloadService(null, null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/caseloadService')

describe('Route Handlers - Vary Licence - Caseload', () => {
  const handler = new CaseloadRoutes(caseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    caseloadService.getStaffVaryCaseload.mockResolvedValue([
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.ACTIVE,
          },
        ],
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          releaseDate: '2022-05-01',
        } as Prisoner,
        deliusRecord: {
          otherIds: {
            crn: 'X12345',
          },
        } as DeliusRecord,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licences: [
          {
            id: 2,
            type: LicenceType.AP,
            status: LicenceStatus.REVIEW_NEEDED,
          },
        ],
        nomisRecord: {
          firstName: 'John',
          lastName: 'Deer',
          prisonerNumber: 'A1234AR',
          releaseDate: '2022-05-02',
        } as Prisoner,
        deliusRecord: {
          otherIds: {
            crn: 'X12346',
          },
        } as DeliusRecord,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
    ])

    caseloadService.getTeamVaryCaseload.mockResolvedValue([
      {
        licences: [
          {
            id: 1,
            type: LicenceType.AP,
            status: LicenceStatus.ACTIVE,
          },
        ],
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          releaseDate: '2022-05-01',
        } as Prisoner,
        deliusRecord: {
          otherIds: {
            crn: 'X12345',
          },
        } as DeliusRecord,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
      {
        licences: [
          {
            id: 2,
            type: LicenceType.AP,
            status: LicenceStatus.ACTIVE,
          },
        ],
        nomisRecord: {
          firstName: 'Dr',
          lastName: 'Who',
          prisonerNumber: 'A1234AB',
          releaseDate: '2022-05-01',
        } as Prisoner,
        deliusRecord: {
          otherIds: {
            crn: 'X12346',
          },
        } as DeliusRecord,
        probationPractitioner: {
          name: 'Sherlock Holmes',
        },
      },
      {
        licences: [
          {
            id: 3,
            type: LicenceType.AP,
            status: LicenceStatus.REVIEW_NEEDED,
          },
        ],
        nomisRecord: {
          firstName: 'John',
          lastName: 'Deer',
          prisonerNumber: 'A1234AR',
          releaseDate: '2022-05-02',
        } as Prisoner,
        deliusRecord: {
          otherIds: {
            crn: 'X12346',
          },
        } as DeliusRecord,
        probationPractitioner: {
          name: 'Walter White',
        },
      },
    ])
  })

  describe('GET', () => {
    beforeEach(() => {
      req = {
        query: {},
        session: {
          teamSelection: ['teamA'],
        },
      } as Request

      res = {
        render: jest.fn(),
        locals: {
          user: {
            username: 'USER1',
            deliusStaffIdentifier: 2000,
            probationTeamCodes: ['teamA', 'teamB'],
            probationTeams: [
              {
                code: 'teamA',
                label: 'teamA',
              },
              {
                code: 'teamB',
                label: 'teamB',
              },
            ],
          },
        },
      } as unknown as Response
    })

    it('should render view with My Cases tab selected', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 2,
            name: 'John Deer',
            crnNumber: 'X12346',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        multipleTeams: false,
        search: undefined,
        statusConfig,
        teamName: null,
        teamView: false,
      })
      expect(caseloadService.getStaffVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should render view with Team Cases tab selected', async () => {
      req.query.view = 'team'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 3,
            name: 'John Deer',
            crnNumber: 'X12346',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
          {
            licenceId: 2,
            name: 'Dr Who',
            crnNumber: 'X12346',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Sherlock Holmes',
            },
          },
        ],
        multipleTeams: true,
        search: undefined,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should render the non-active licence if 2 exist', async () => {
      caseloadService.getStaffVaryCaseload.mockResolvedValue([
        {
          licences: [
            {
              id: 2,
              type: LicenceType.AP,
              status: LicenceStatus.VARIATION_IN_PROGRESS,
            },
            {
              id: 1,
              type: LicenceType.AP,
              status: LicenceStatus.ACTIVE,
            },
          ],
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '2022-05-01',
          } as Prisoner,
          deliusRecord: {
            otherIds: {
              crn: 'X12345',
            },
          } as DeliusRecord,
          probationPractitioner: {
            name: 'Walter White',
          },
        },
      ])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 2,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.VARIATION_IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        multipleTeams: false,
        search: undefined,
        statusConfig,
        teamName: null,
        teamView: false,
      })
      expect(caseloadService.getStaffVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should successfully search by name', async () => {
      req.query.view = 'team'
      req.query.search = 'smith'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        multipleTeams: true,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        search: 'smith',
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.view = 'team'
      req.query.search = 'white'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 3,
            name: 'John Deer',
            crnNumber: 'X12346',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        multipleTeams: true,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        search: 'white',
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should successfully search by crn', async () => {
      req.query.view = 'team'
      req.query.search = 'x12345'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Walter White',
            },
          },
        ],
        multipleTeams: true,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        search: 'x12345',
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })
  })
})
