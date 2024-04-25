import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import CaseloadService from '../../../services/caseloadService'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import type { DeliusRecord } from '../../../@types/managedCase'
import type { CvlPrisoner } from '../../../@types/licenceApiClientTypes'

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
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        ],
        cvlFields: {
          licenceType: 'AP',
          hardStopDate: '03/01/2023',
          hardStopWarningDate: '01/01/2023',
          isInHardStopPeriod: true,
          isDueForEarlyRelease: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          releaseDate: '2022-05-01',
        } as CvlPrisoner,
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
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        ],
        cvlFields: {
          licenceType: 'AP',
          hardStopDate: '03/01/2023',
          hardStopWarningDate: '01/01/2023',
          isInHardStopPeriod: true,
          isDueForEarlyRelease: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        nomisRecord: {
          firstName: 'John',
          lastName: 'Deer',
          prisonerNumber: 'A1234AR',
          releaseDate: '2022-05-02',
        } as CvlPrisoner,
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
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        ],
        cvlFields: {
          licenceType: 'AP',
          hardStopDate: '03/01/2023',
          hardStopWarningDate: '01/01/2023',
          isInHardStopPeriod: true,
          isDueForEarlyRelease: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        nomisRecord: {
          firstName: 'Bob',
          lastName: 'Smith',
          prisonerNumber: 'A1234AA',
          releaseDate: '2022-05-01',
        } as CvlPrisoner,
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
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        ],
        cvlFields: {
          licenceType: 'AP',
          hardStopDate: '03/01/2023',
          hardStopWarningDate: '01/01/2023',
          isInHardStopPeriod: true,
          isDueForEarlyRelease: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        nomisRecord: {
          firstName: 'Dr',
          lastName: 'Who',
          prisonerNumber: 'A1234AB',
          releaseDate: '2022-05-01',
        } as CvlPrisoner,
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
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
        ],
        cvlFields: {
          licenceType: 'AP',
          hardStopDate: '03/01/2023',
          hardStopWarningDate: '01/01/2023',
          isInHardStopPeriod: true,
          isDueForEarlyRelease: false,
          isDueToBeReleasedInTheNextTwoWorkingDays: false,
        },
        nomisRecord: {
          firstName: 'John',
          lastName: 'Deer',
          prisonerNumber: 'A1234AR',
          releaseDate: '2022-05-02',
        } as CvlPrisoner,
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

    caseloadService.getComReviewCount.mockResolvedValue({
      myCount: 1,
      teams: [
        { teamCode: 'teamA', count: 1 },
        { teamCode: 'teamB', count: 1 },
      ],
    })
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
        myCount: 1,
        teamCount: 2,
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
        myCount: 1,
        teamCount: 1,
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should render the non-active licence if 2 exist', async () => {
      caseloadService.getStaffVaryCaseload.mockResolvedValue([
        {
          licences: [
            {
              id: 1,
              type: LicenceType.AP,
              status: LicenceStatus.ACTIVE,
              isDueToBeReleasedInTheNextTwoWorkingDays: false,
            },
            {
              id: 2,
              type: LicenceType.AP,
              status: LicenceStatus.VARIATION_IN_PROGRESS,
              isDueToBeReleasedInTheNextTwoWorkingDays: false,
            },
          ],
          cvlFields: {
            licenceType: 'AP',
            hardStopDate: '03/01/2023',
            hardStopWarningDate: '01/01/2023',
            isInHardStopPeriod: true,
            isDueForEarlyRelease: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '2022-05-01',
          } as CvlPrisoner,
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
        myCount: 1,
        teamCount: 2,
      })
      expect(caseloadService.getStaffVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should ignore any timed out licences', async () => {
      caseloadService.getStaffVaryCaseload.mockResolvedValue([
        {
          licences: [
            {
              id: 1,
              type: LicenceType.AP,

              status: LicenceStatus.TIMED_OUT,
              isDueToBeReleasedInTheNextTwoWorkingDays: false,
            },
            {
              id: 2,
              type: LicenceType.AP,
              status: LicenceStatus.VARIATION_IN_PROGRESS,
              isDueToBeReleasedInTheNextTwoWorkingDays: false,
            },
          ],
          cvlFields: {
            licenceType: 'AP',
            hardStopDate: '03/01/2023',
            hardStopWarningDate: '01/01/2023',
            isInHardStopPeriod: true,
            isDueForEarlyRelease: false,
            isDueToBeReleasedInTheNextTwoWorkingDays: false,
          },
          nomisRecord: {
            firstName: 'Bob',
            lastName: 'Smith',
            prisonerNumber: 'A1234AA',
            releaseDate: '2022-05-01',
          } as CvlPrisoner,
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
        myCount: 1,
        teamCount: 2,
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
        myCount: 1,
        teamCount: 1,
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
        myCount: 1,
        teamCount: 1,
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
        myCount: 1,
        teamCount: 1,
      })
      expect(caseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should return REVIEW NEEDED cases to top of caseload', () => {
      const caseload = [
        {
          licenceId: 1,
          name: 'Dat Kia',
          crnNumber: 'L258123',
          licenceType: 'AP',
          releaseDate: '21 Oct 2024',
          licenceStatus: LicenceStatus.REVIEW_NEEDED,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 2,
          name: 'Ema Ely',
          crnNumber: 'Z265291',
          licenceType: 'AP',
          releaseDate: '17 Jul 2024',
          licenceStatus: LicenceStatus.ACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 3,
          name: 'Emaj Elys',
          crnNumber: 'Z265292',
          licenceType: 'AP',
          releaseDate: '23 Jul 2024',
          licenceStatus: LicenceStatus.INACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 4,
          name: 'Emajinhany Elysasha',
          crnNumber: 'Z265290',
          licenceType: 'AP',
          releaseDate: '16 Jul 2024',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 5,
          name: 'Datessdu Kiarerick',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '20 Oct 2024',
          licenceStatus: LicenceStatus.REVIEW_NEEDED,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 6,
          name: 'Emajin Elysa',
          crnNumber: 'Z265294',
          licenceType: 'AP',
          releaseDate: '30 Nov 2024',
          licenceStatus: LicenceStatus.ACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 7,
          name: 'Datessdu Kiarerick',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '5 Dec 2023',
          licenceStatus: LicenceStatus.REVIEW_NEEDED,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
        {
          licenceId: 8,
          name: 'Datessdu Kiarerick',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '5 Dec 2024',
          licenceStatus: LicenceStatus.ACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
          },
        },
      ]
      const sortedCaseload = [
        {
          licenceId: 7,
          name: 'Datessdu Kiarerick',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '5 Dec 2023',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 5,
          name: 'Datessdu Kiarerick',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '20 Oct 2024',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 1,
          name: 'Dat Kia',
          crnNumber: 'L258123',
          licenceType: 'AP',
          releaseDate: '21 Oct 2024',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 4,
          name: 'Emajinhany Elysasha',
          crnNumber: 'Z265290',
          licenceType: 'AP',
          releaseDate: '16 Jul 2024',
          licenceStatus: 'IN_PROGRESS',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 2,
          name: 'Ema Ely',
          crnNumber: 'Z265291',
          licenceType: 'AP',
          releaseDate: '17 Jul 2024',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 3,
          name: 'Emaj Elys',
          crnNumber: 'Z265292',
          licenceType: 'AP',
          releaseDate: '23 Jul 2024',
          licenceStatus: 'INACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 6,
          name: 'Emajin Elysa',
          crnNumber: 'Z265294',
          licenceType: 'AP',
          releaseDate: '30 Nov 2024',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
        {
          licenceId: 8,
          name: 'Datessdu Kiarerick',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '5 Dec 2024',
          licenceStatus: 'ACTIVE',
          probationPractitioner: { staffCode: 'X12342', name: 'CVL COM' },
        },
      ]
      expect(caseload.sort(handler.prioritiseReviewNeeded)).toEqual(sortedCaseload)
    })

    it('should render view with my count 2 and team count 5 with My Cases tab selected', async () => {
      caseloadService.getComReviewCount.mockResolvedValue({
        myCount: 2,
        teams: [
          { teamCode: 'teamA', count: 2 },
          { teamCode: 'teamB', count: 3 },
        ],
      })
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
        myCount: 2,
        teamCount: 5,
      })
    })

    it('should render view with my count 2 and team count 3 with Team Cases tab selected', async () => {
      req = {
        query: {},
        session: {
          teamSelection: ['teamB'],
        },
      } as Request
      caseloadService.getComReviewCount.mockResolvedValue({
        myCount: 2,
        teams: [
          { teamCode: 'teamA', count: 2 },
          { teamCode: 'teamB', count: 3 },
        ],
      })
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
        teamName: 'teamB',
        teamView: true,
        myCount: 2,
        teamCount: 3,
      })
    })
  })
})
