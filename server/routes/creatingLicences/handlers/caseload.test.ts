import { Request, Response } from 'express'
import CaseloadRoutes from './caseload'
import statusConfig from '../../../licences/licenceStatus'
import LicenceStatus from '../../../enumeration/licenceStatus'
import LicenceType from '../../../enumeration/licenceType'
import LicenceKind from '../../../enumeration/LicenceKind'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { ComCase } from '../../../@types/licenceApiClientTypes'
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
        name: 'John Roberts',
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
          staffIdentifier: 2000,
        },
      },
    ] as unknown as ComCase[])

    comCaseloadService.getTeamCreateCaseload.mockResolvedValue([
      {
        crnNumber: 'X381306',
        name: 'John Roberts',
        releaseDate: '12/10/2022',
        prisonerNumber: '123',
        licenceId: 1,
        licenceType: LicenceType.AP,
        licenceStatus: LicenceStatus.IN_PROGRESS,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
        probationPractitioner: {
          name: 'Sherlock Holmes',
          staffIdentifier: 3000,
        },
        isClickable: true,
        createLink: '/licence/create/id/1/check-your-answers',
      },
      {
        crnNumber: 'X381307',
        name: 'Dr Who',
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
        name: 'Mabel Moorhouse',
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
        name: 'Ronald Recall',
        releaseDate: '12/10/2022',
        prisonerNumber: '126',
        licenceId: 4,
        licenceType: LicenceType.AP_PSS,
        licenceStatus: LicenceStatus.OOS_RECALL,
        hardStopDate: '10/10/2022',
        hardStopWarningDate: '10/10/2022',
        kind: LicenceKind.CRD,
      },
    ] as unknown as ComCase[])
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
            name: 'John Roberts',
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
              staffIdentifier: 2000,
            },
            sortDate: parseIsoDate('2022-10-12'),
            createLink: '/licence/create/id/1/check-your-answers',
            isClickable: true,
          },
        ],
        multipleTeams: false,
        statusConfig,
        teamView: false,
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
            name: 'John Roberts',
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
              name: 'Sherlock Holmes',
              staffIdentifier: 3000,
            },
            isClickable: true,
            createLink: '/licence/create/id/1/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
          {
            name: 'Dr Who',
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
            name: 'Mabel Moorhouse',
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
            name: 'Ronald Recall',
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
        teamView: true,
      })
      expect(comCaseloadService.getTeamCreateCaseload).toHaveBeenCalledWith(res.locals.user, ['teamA'])
      expect(comCaseloadService.getStaffCreateCaseload).not.toHaveBeenCalled()
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
          name: 'John Roberts',
          releaseDate: '12/10/2022',
          sortDate: '12/10/2022',
          prisonerNumber: '123',
          licenceId: 2,
          licenceType: LicenceType.AP,
          licenceStatus: LicenceStatus.IN_PROGRESS,
          hardStopDate: '10/10/2022',
          hardStopWarningDate: '10/10/2022',
          kind: LicenceKind.CRD,
          probationPractitioner: {
            name: 'Joe Bloggs',
          },
          createLink: '/licence/create/id/2/check-your-answers',
          isClickable: true,
        },
      ] as unknown as ComCase[])

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/caseload', {
        caseload: [
          {
            licenceId: 2,
            name: 'John Roberts',
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
            },
            isClickable: true,
            createLink: '/licence/create/id/2/check-your-answers',
            sortDate: parseIsoDate('2022-10-12'),
          },
        ],
        multipleTeams: false,
        statusConfig,
        teamName: null,
        teamView: false,
      })
      expect(comCaseloadService.getStaffCreateCaseload).toHaveBeenCalledWith(res.locals.user)
    })
  })
})
