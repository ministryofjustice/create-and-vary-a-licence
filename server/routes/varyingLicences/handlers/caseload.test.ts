import { Request, Response } from 'express'

import CaseloadRoutes from './caseload'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import LicenceKind from '../../../enumeration/LicenceKind'

const comCaseloadService = new ComCaseloadService(null, null) as jest.Mocked<ComCaseloadService>

jest.mock('../../../services/lists/comCaseloadService')

describe('Route Handlers - Vary Licence - Caseload', () => {
  const handler = new CaseloadRoutes(comCaseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    comCaseloadService.getStaffVaryCaseload.mockResolvedValue([
      {
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        kind: LicenceKind.CRD,
        prisonerNumber: 'A1234AA',
        releaseDate: '01/05/2022',
        crnNumber: 'X12345',
        name: 'Bob Smith',
        probationPractitioner: {
          name: 'Test Com',
          allocated: true,
        },
        isReviewNeeded: false,
        isRestricted: false,
      },
      {
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        name: 'Joe Bloggs',
        prisonerNumber: 'A1234AR',
        releaseDate: '02/05/2022',
        crnNumber: 'X12346',
        probationPractitioner: {
          name: 'Test Com',
          allocated: true,
        },
        kind: LicenceKind.CRD,
        isReviewNeeded: true,
        isRestricted: false,
      },
    ])

    comCaseloadService.getTeamVaryCaseload.mockResolvedValue([
      {
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        name: 'Bob Smith',
        prisonerNumber: 'A1234AA',
        releaseDate: '01/05/2022',
        crnNumber: 'X12345',
        probationPractitioner: {
          name: 'Test Com',
          allocated: true,
        },
        kind: LicenceKind.CRD,
        isReviewNeeded: false,
        isRestricted: false,
      },
      {
        licenceId: 2,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        name: 'Person Seven',
        prisonerNumber: 'A1234AB',
        releaseDate: '01/05/2022',
        crnNumber: 'X12346',
        probationPractitioner: {
          name: 'Another Com',
          allocated: true,
        },
        kind: LicenceKind.CRD,
        isReviewNeeded: false,
        isRestricted: false,
      },
      {
        licenceId: 3,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.ACTIVE,
        name: 'Joe Bloggs',
        prisonerNumber: 'A1234AR',
        releaseDate: '02/05/2022',
        crnNumber: 'X12346',
        probationPractitioner: {
          name: 'Test Com',
          allocated: true,
        },
        kind: LicenceKind.CRD,
        isReviewNeeded: true,
        isRestricted: false,
      },
    ])

    comCaseloadService.getComReviewCount.mockResolvedValue({
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
            name: 'Joe Bloggs',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AR',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: true,
            isRestricted: false,
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: false,
        search: undefined,
        statusConfig,
        teamName: null,
        teamView: false,
        myCount: 1,
        teamCount: 2,
        hasPriorityCases: true,
      })
      expect(comCaseloadService.getStaffVaryCaseload).toHaveBeenCalledWith(res.locals.user)
    })

    it('should render view with Team Cases tab selected', async () => {
      req.query.view = 'team'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 3,
            name: 'Joe Bloggs',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AR',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: true,
            isRestricted: false,
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
          {
            licenceId: 2,
            name: 'Person Seven',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AB',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Another Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: true,
        search: undefined,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        myCount: 1,
        teamCount: 1,
        hasPriorityCases: true,
      })
      expect(comCaseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should render view with null release date', async () => {
      comCaseloadService.getTeamVaryCaseload.mockResolvedValue([
        {
          licenceId: 1,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.ACTIVE,
          name: 'Bob Smith',
          prisonerNumber: 'A1234AA',
          releaseDate: null,
          crnNumber: 'X12345',
          probationPractitioner: {
            name: 'Test Com',
            allocated: true,
          },
          isReviewNeeded: false,
          kind: LicenceKind.CRD,
          isRestricted: false,
        },
      ])
      comCaseloadService.getComReviewCount.mockResolvedValueOnce({
        myCount: 1,
        teams: [{ teamCode: 'teamA', count: 1 }],
      })

      req.query.view = 'team'
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            prisonerNumber: 'A1234AA',
            releaseDate: 'not found',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            isReviewNeeded: false,
            kind: LicenceKind.CRD,
            isRestricted: false,
          },
        ],
        multipleTeams: true,
        search: undefined,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        myCount: 1,
        teamCount: 1,
        hasPriorityCases: false,
      })
      expect(comCaseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
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
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: true,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        search: 'smith',
        myCount: 1,
        teamCount: 1,
        hasPriorityCases: false,
      })
      expect(comCaseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should successfully search by probation practitioner', async () => {
      req.query.view = 'team'
      req.query.search = 'test'

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/vary/caseload', {
        caseload: [
          {
            licenceId: 3,
            name: 'Joe Bloggs',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AR',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: true,
            isRestricted: false,
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: true,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        search: 'test',
        myCount: 1,
        teamCount: 1,
        hasPriorityCases: true,
      })
      expect(comCaseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
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
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: true,
        statusConfig,
        teamName: 'teamA',
        teamView: true,
        search: 'x12345',
        myCount: 1,
        teamCount: 1,
        hasPriorityCases: false,
      })
      expect(comCaseloadService.getTeamVaryCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
    })

    it('should return REVIEW NEEDED cases to top of caseload', () => {
      const caseload = [
        {
          licenceId: 1,
          name: 'Test Person',
          crnNumber: 'L258123',
          licenceType: 'AP',
          releaseDate: '21 Oct 2024',
          licenceStatus: LicenceStatus.REVIEW_NEEDED,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: true,
          isRestricted: false,
        },
        {
          licenceId: 2,
          name: 'Another Person',
          crnNumber: 'Z265291',
          licenceType: 'AP',
          releaseDate: '17 Jul 2024',
          licenceStatus: LicenceStatus.ACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 3,
          name: 'Person Three',
          crnNumber: 'Z265292',
          licenceType: 'AP',
          releaseDate: '23 Jul 2024',
          licenceStatus: LicenceStatus.INACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 4,
          name: 'Person Four',
          crnNumber: 'Z265290',
          licenceType: 'AP',
          releaseDate: '16 Jul 2024',
          licenceStatus: LicenceStatus.IN_PROGRESS,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 5,
          name: 'Person Six',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '20 Oct 2024',
          licenceStatus: LicenceStatus.REVIEW_NEEDED,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: true,
          isRestricted: false,
        },
        {
          licenceId: 6,
          name: 'Person Five',
          crnNumber: 'Z265294',
          licenceType: 'AP',
          releaseDate: '30 Nov 2024',
          licenceStatus: LicenceStatus.ACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 7,
          name: 'Person Six',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '05 Dec 2023',
          licenceStatus: LicenceStatus.REVIEW_NEEDED,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: true,
          isRestricted: false,
        },
        {
          licenceId: 8,
          name: 'Person Six',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '05 Dec 2024',
          licenceStatus: LicenceStatus.ACTIVE,
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
      ]
      const sortedCaseload = [
        {
          licenceId: 7,
          name: 'Person Six',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '05 Dec 2023',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: true,
          isRestricted: false,
        },
        {
          licenceId: 5,
          name: 'Person Six',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '20 Oct 2024',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: true,
          isRestricted: false,
        },
        {
          licenceId: 1,
          name: 'Test Person',
          crnNumber: 'L258123',
          licenceType: 'AP',
          releaseDate: '21 Oct 2024',
          licenceStatus: 'REVIEW_NEEDED',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: true,
          isRestricted: false,
        },
        {
          licenceId: 4,
          name: 'Person Four',
          crnNumber: 'Z265290',
          licenceType: 'AP',
          releaseDate: '16 Jul 2024',
          licenceStatus: 'IN_PROGRESS',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 2,
          name: 'Another Person',
          crnNumber: 'Z265291',
          licenceType: 'AP',
          releaseDate: '17 Jul 2024',
          licenceStatus: 'ACTIVE',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 3,
          name: 'Person Three',
          crnNumber: 'Z265292',
          licenceType: 'AP',
          releaseDate: '23 Jul 2024',
          licenceStatus: 'INACTIVE',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 6,
          name: 'Person Five',
          crnNumber: 'Z265294',
          licenceType: 'AP',
          releaseDate: '30 Nov 2024',
          licenceStatus: 'ACTIVE',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
        {
          licenceId: 8,
          name: 'Person Six',
          crnNumber: 'L258122',
          licenceType: 'AP',
          releaseDate: '05 Dec 2024',
          licenceStatus: 'ACTIVE',
          probationPractitioner: {
            staffCode: 'X12342',
            name: 'CVL COM',
            allocated: true,
          },
          kind: LicenceKind.CRD,
          isReviewNeeded: false,
          isRestricted: false,
        },
      ]
      expect(caseload.sort(handler.prioritiseReviewNeeded)).toEqual(sortedCaseload)
    })

    it('should render view with my count 2 and team count 5 with My Cases tab selected', async () => {
      comCaseloadService.getComReviewCount.mockResolvedValue({
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
            name: 'Joe Bloggs',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AR',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: true,
            isRestricted: false,
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: false,
        search: undefined,
        statusConfig,
        teamName: null,
        teamView: false,
        myCount: 2,
        teamCount: 5,
        hasPriorityCases: true,
      })
    })

    it('should render view with my count 2 and team count 3 with Team Cases tab selected', async () => {
      req = {
        query: {},
        session: {
          teamSelection: ['teamB'],
        },
      } as Request
      comCaseloadService.getComReviewCount.mockResolvedValue({
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
            name: 'Joe Bloggs',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AR',
            releaseDate: '02 May 2022',
            licenceStatus: LicenceStatus.REVIEW_NEEDED,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: true,
            isRestricted: false,
          },
          {
            licenceId: 1,
            name: 'Bob Smith',
            crnNumber: 'X12345',
            prisonerNumber: 'A1234AA',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
          {
            licenceId: 2,
            name: 'Person Seven',
            crnNumber: 'X12346',
            prisonerNumber: 'A1234AB',
            releaseDate: '01 May 2022',
            licenceStatus: LicenceStatus.ACTIVE,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Another Com',
              allocated: true,
            },
            kind: LicenceKind.CRD,
            isReviewNeeded: false,
            isRestricted: false,
          },
        ],
        multipleTeams: true,
        search: undefined,
        statusConfig,
        teamName: 'teamB',
        teamView: true,
        myCount: 2,
        teamCount: 3,
        hasPriorityCases: true,
      })
    })
  })
})
