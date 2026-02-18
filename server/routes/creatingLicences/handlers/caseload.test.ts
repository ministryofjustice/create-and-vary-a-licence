import { Request, Response } from 'express'
import CaseloadRoutes from './caseload'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import LicenceKind from '../../../enumeration/LicenceKind'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { ComCreateCase } from '../../../@types/licenceApiClientTypes'
import { parseIsoDate } from '../../../utils/utils'

const comCaseloadService = new ComCaseloadService(null, null) as jest.Mocked<ComCaseloadService>

jest.mock('../../../services/lists/comCaseloadService')

describe('Route Handlers - Create Licence - Caseload', () => {
  const handler = new CaseloadRoutes(comCaseloadService)
  let req: Request
  let res: Response

  beforeEach(() => {
    comCaseloadService.getStaffCreateCaseload.mockResolvedValue([
      {
        crnNumber: 'X381306',
        name: 'Test Person',
        releaseDate: '12/10/2022',
        prisonerNumber: '123',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
        probationPractitioner: {
          name: 'Joe Bloggs',
          staffCode: 'X6789',
          allocated: true,
        },
      },
      {
        crnNumber: 'X381307',
        name: 'Another Person',
        releaseDate: '11/10/2022',
        prisonerNumber: '456',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.TIME_SERVED,
        probationPractitioner: {
          name: 'Not Allocated',
          staffCode: 'X6789U',
          allocated: false,
        },
      },
      {
        crnNumber: 'X381308',
        name: 'Person Three',
        releaseDate: '12/10/2022',
        prisonerNumber: '789',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '11/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.HARD_STOP,
        probationPractitioner: {
          name: 'Not Allocated',
          staffCode: 'X6789U',
          allocated: true,
        },
      },
      {
        crnNumber: 'X381309',
        name: 'Person Four',
        releaseDate: '03/10/2022',
        prisonerNumber: '321',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '01/10/2022',
        hardStopWarningDate: '01/10/2022',
        kind: LicenceKind.CRD,
        probationPractitioner: {
          name: 'Not Allocated',
          staffCode: 'X6789U',
          allocated: false,
        },
      },
    ] as unknown as ComCreateCase[])

    comCaseloadService.getTeamCreateCaseload.mockResolvedValue([
      {
        crnNumber: 'X381306',
        name: 'Test Person',
        releaseDate: '12/10/2022',
        prisonerNumber: '123',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
        probationPractitioner: {
          name: 'Test Com',
          staffCode: 'X12345',
          allocated: true,
        },
      },
      {
        crnNumber: 'X381307',
        name: 'Another Person',
        releaseDate: '12/10/2022',
        prisonerNumber: '124',
        licenceId: 2,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
      },
      {
        crnNumber: 'X381308',
        name: 'Person Three',
        releaseDate: '12/10/2022',
        prisonerNumber: '125',
        licenceId: 3,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.NOT_IN_PILOT,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
      },
      {
        crnNumber: 'X381309',
        name: 'Recall Person',
        releaseDate: '12/10/2022',
        prisonerNumber: '126',
        licenceId: 4,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.OOS_RECALL,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
      },
    ] as unknown as ComCreateCase[])
  })

  afterEach(() => {
    jest.resetAllMocks()
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
        redirect: jest.fn(),
        locals: {
          user: {
            username: 'USER1',
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
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Test Person',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'CRD',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Joe Bloggs',
              staffCode: 'X6789',
              allocated: true,
            },
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
          {
            crnNumber: 'X381307',
            name: 'Another Person',
            releaseDate: '11 Oct 2022',
            prisonerNumber: '456',
            licenceId: 1,
            licenceType: LicenceType.AP,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'TIME_SERVED',
            probationPractitioner: {
              name: 'Not Allocated',
              staffCode: 'X6789U',
              allocated: false,
            },
            sortDate: parseIsoDate('2022-10-11'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
          {
            crnNumber: 'X381308',
            name: 'Person Three',
            releaseDate: '12 Oct 2022',
            prisonerNumber: '789',
            licenceId: 1,
            licenceType: LicenceType.AP,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            hardStopDate: '11/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'HARD_STOP',
            probationPractitioner: {
              name: 'Not Allocated',
              staffCode: 'X6789U',
              allocated: true,
            },
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
          {
            crnNumber: 'X381309',
            name: 'Person Four',
            releaseDate: '3 Oct 2022',
            prisonerNumber: '321',
            licenceId: 1,
            licenceType: LicenceType.AP,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            hardStopDate: '01/10/2022',
            hardStopWarningDate: '01/10/2022',
            kind: 'CRD',
            probationPractitioner: {
              name: 'Not Allocated',
              staffCode: 'X6789U',
              allocated: false,
            },
            sortDate: parseIsoDate('2022-10-03'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: false,
          },
        ],
        multipleTeams: false,
        statusConfig,
        view: 'me',
        teamName: null,
      })
      expect(comCaseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(comCaseloadService.getTeamCreateCaseload).not.toHaveBeenCalled()
    })

    it('should render view with Team Cases tab selected', async () => {
      req.query = { view: 'team' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Test Person',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'CRD',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Test Com',
              staffCode: 'X12345',
              allocated: true,
            },
            isClickable: true,
            createLink: '/licence/create/id/1/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
          {
            name: 'Another Person',
            crnNumber: 'X381307',
            releaseDate: '12 Oct 2022',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'CRD',
            prisonerNumber: '124',
            licenceId: 2,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP_PSS,
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/2/check-your-answers',
            isClickable: false,
          },
          {
            name: 'Person Three',
            crnNumber: 'X381308',
            releaseDate: '12 Oct 2022',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'CRD',
            prisonerNumber: '125',
            licenceId: 3,
            licenceStatus: LicenceStatus.NOT_IN_PILOT,
            licenceType: LicenceType.AP_PSS,
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/3/check-your-answers',
            isClickable: false,
          },
          {
            name: 'Recall Person',
            crnNumber: 'X381309',
            releaseDate: '12 Oct 2022',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'CRD',
            prisonerNumber: '126',
            licenceId: 4,
            licenceStatus: LicenceStatus.OOS_RECALL,
            licenceType: LicenceType.AP_PSS,
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/4/check-your-answers',
            isClickable: false,
          },
        ],
        statusConfig,
        multipleTeams: true,
        teamName: 'teamA',
        view: 'team',
      })
      expect(comCaseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
      expect(comCaseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
    })

    it('should render view with My HDC Cases tab selected', async () => {
      req.query = { view: 'hdc' }

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            name: 'Test Person',
            crnNumber: 'X381306',
            releaseDate: '12 Oct 2022',
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'CRD',
            prisonerNumber: '123',
            licenceId: 1,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Joe Bloggs',
              staffCode: 'X6789',
              allocated: true,
            },
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
          {
            crnNumber: 'X381307',
            name: 'Another Person',
            releaseDate: '11 Oct 2022',
            prisonerNumber: '456',
            licenceId: 1,
            licenceType: LicenceType.AP,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'TIME_SERVED',
            probationPractitioner: {
              name: 'Not Allocated',
              staffCode: 'X6789U',
              allocated: false,
            },
            sortDate: parseIsoDate('2022-10-11'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
          {
            crnNumber: 'X381308',
            name: 'Person Three',
            releaseDate: '12 Oct 2022',
            prisonerNumber: '789',
            licenceId: 1,
            licenceType: LicenceType.AP,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            hardStopDate: '11/10/2022',
            hardStopWarningDate: '10/10/2022',
            kind: 'HARD_STOP',
            probationPractitioner: {
              name: 'Not Allocated',
              staffCode: 'X6789U',
              allocated: true,
            },
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
          {
            crnNumber: 'X381309',
            name: 'Person Four',
            releaseDate: '3 Oct 2022',
            prisonerNumber: '321',
            licenceId: 1,
            licenceType: LicenceType.AP,
            licenceStatus: LicenceStatus.IN_PROGRESS,
            hardStopDate: '01/10/2022',
            hardStopWarningDate: '01/10/2022',
            kind: 'CRD',
            probationPractitioner: {
              name: 'Not Allocated',
              staffCode: 'X6789U',
              allocated: false,
            },
            sortDate: parseIsoDate('2022-10-03'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: false,
          },
        ],
        multipleTeams: false,
        statusConfig,
        view: 'hdc',
        teamName: null,
      })
      expect(comCaseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
      expect(comCaseloadService.getTeamCreateCaseload).not.toHaveBeenCalled()
    })

    it('should redirect to change team page when user has multiple teams and no active team selected', async () => {
      req.query = { view: 'team' }
      req.session.teamSelection = null
      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith('caseload/change-team')
    })

    it('should use default team if user has only one assigned', async () => {
      req.query = { view: 'team' }
      req.session.teamSelection = null
      res.locals.user.probationTeams = [{ code: 'ABC', label: 'Team A' }]
      res.locals.user.probationTeamCodes = ['ABC']

      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledTimes(0)
    })

    it('should render the non-approved licence if 2 exist', async () => {
      comCaseloadService.getStaffCreateCaseload.mockResolvedValue([
        {
          crnNumber: 'X381306',
          name: 'Test Person',
          releaseDate: '12/10/2022',
          prisonerNumber: '123',
          licenceId: 2,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          hardStopDate: '10/10/2022',
          hardStopWarningDate: '10/10/2022',
          kind: LicenceKind.CRD,
          probationPractitioner: {
            name: 'Joe Bloggs',
            staffCode: 'X12345',
            allocated: true,
          },
        },
      ] as unknown as ComCreateCase[])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            licenceId: 2,
            name: 'Test Person',
            crnNumber: 'X381306',
            prisonerNumber: '123',
            releaseDate: '12 Oct 2022',
            kind: LicenceKind.CRD,
            hardStopDate: '10/10/2022',
            hardStopWarningDate: '10/10/2022',
            licenceStatus: LicenceStatus.IN_PROGRESS,
            licenceType: LicenceType.AP,
            probationPractitioner: {
              name: 'Joe Bloggs',
              staffCode: 'X12345',
              allocated: true,
            },
            isClickable: true,
            createLink: '/licence/create/id/2/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
        ],
        multipleTeams: false,
        statusConfig,
        teamName: null,
        view: 'me',
      })
      expect(comCaseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
    })
  })
})
