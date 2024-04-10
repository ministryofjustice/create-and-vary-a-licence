import { NextFunction, Request, Response } from 'express'
import ChangeTeamRoutes from './changeTeam'
import CaseloadService from '../../../services/caseloadService'

const caseloadService = new CaseloadService(null, null, null, null) as jest.Mocked<CaseloadService>

jest.mock('../../../services/caseloadService')

describe('Route Handlers - ChangeLocationRoutes', () => {
  const handler = new ChangeTeamRoutes(caseloadService)
  let req: Request
  let res: Response
  let next: NextFunction

  const probationTeams = [
    { code: 'ABC', label: 'Team One', count: 0 },
    { code: 'ABCD', label: 'Team Two', count: 0 },
    { code: 'ABCDE', label: 'Team Three', count: 0 },
  ]

  beforeEach(() => {
    res = {
      locals: {
        user: {
          probationTeams,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    req = {
      session: { teamSelection: null },
      body: { teams: [] },
      query: {},
      route: {
        path: '/licence/create/caseload/change-team',
      },
    } as unknown as Request

    caseloadService.getComReviewCount.mockResolvedValue({
      myCount: 1,
      teams: [
        { teamCode: 'ABC', count: 3 },
        { teamCode: 'teamB', count: 1 },
      ],
    })
  })

  describe('GET', () => {
    it('Should list all teams with no selected team', async () => {
      await handler.GET()(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/changeTeam', {
        probationTeamsWithCount: probationTeams,
        checked: null,
        backLinkHref: '/licence/create/caseload',
        validationErrors: [],
        showTeamsCount: false,
      })
    })

    it('Should list all teams with active team', async () => {
      req.session.teamSelection = ['ABCD']
      await handler.GET()(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/changeTeam', {
        backLinkHref: '/licence/create/caseload?view=team',
        probationTeamsWithCount: probationTeams,
        checked: ['ABCD'],
        validationErrors: [],
        showTeamsCount: false,
      })
    })

    it('Should redirect to caseload page if number of user teams is one', async () => {
      res.locals.user.probationTeams = [{ code: 'ABC', label: 'Team One' }]
      await handler.GET()(req, res, next)
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/caseload')
    })

    it('Should list all teams with no selected team and showTeamsCount false', async () => {
      caseloadService.getComReviewCount.mockResolvedValue({
        myCount: 1,
        teams: [
          { teamCode: 'teamA', count: 3 },
          { teamCode: 'teamB', count: 1 },
        ],
      })
      await handler.GET()(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/changeTeam', {
        probationTeamsWithCount: probationTeams,
        checked: null,
        backLinkHref: '/licence/create/caseload',
        validationErrors: [],
        showTeamsCount: false,
      })
    })

    it('Should display team case count', async () => {
      req.route.path = '/licence/vary/caseload/change-team'
      req.session.teamSelection = ['ABCD']
      await handler.GET()(req, res, next)
      expect(res.render).toHaveBeenCalledWith('pages/changeTeam', {
        backLinkHref: '/licence/vary/caseload?view=team',
        probationTeamsWithCount: [
          { code: 'ABC', label: 'Team One', count: 3 },
          { code: 'ABCD', label: 'Team Two', count: 0 },
          { code: 'ABCDE', label: 'Team Three', count: 0 },
        ],
        checked: ['ABCD'],
        validationErrors: [],
        showTeamsCount: true,
      })
    })
  })

  describe('POST', () => {
    it('Should accept valid Team Code and redirect to team caseload page', async () => {
      req.body.teams = ['ABCDE']
      await handler.POST()(req, res, next)
      expect(req.session.teamSelection).toEqual(['ABCDE'])
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/caseload?view=team')
    })

    it('Should not accept invalid Team Code and display error message', async () => {
      await handler.POST()(req, res, next)
      expect(req.session.teamSelection).toEqual(null)
      expect(res.render).toHaveBeenCalledWith('pages/changeTeam', {
        probationTeamsWithCount: probationTeams,
        backLinkHref: '/licence/create/caseload',
        checked: null,
        validationErrors: [{ field: 'teams', message: 'Select the team you wish to view cases for' }],
        showTeamsCount: false,
      })
    })
  })
})
