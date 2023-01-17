import { NextFunction, Request, Response } from 'express'
import ChangeTeamRoutes from './changeTeam'

describe('Route Handlers - ChangeLocationRoutes', () => {
  const handler = new ChangeTeamRoutes()
  let req: Request
  let res: Response
  let next: NextFunction

  const probationTeams = [
    { code: 'ABC', label: 'Team One' },
    { code: 'ABCD', label: 'Team Two' },
    { code: 'ABCDE', label: 'Team Three' },
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
    } as unknown as Request
  })

  describe('GET', () => {
    it('Should list all teams with no selected team', async () => {
      await handler.GET()(req, res, next)
      expect(res.render).toBeCalledWith('pages/changeTeam', { probationTeams, checked: null, validationErrors: [] })
    })

    it('Should list all teams with active team', async () => {
      req.session.teamSelection = ['ABCD']
      await handler.GET()(req, res, next)
      expect(res.render).toBeCalledWith('pages/changeTeam', { probationTeams, checked: ['ABCD'], validationErrors: [] })
    })

    it('Should redirect to caseload page if number of user teams is one', async () => {
      res.locals.user.probationTeams = [{ code: 'ABC', label: 'Team One' }]
      await handler.GET()(req, res, next)
      expect(res.redirect).toBeCalledWith('/licence/create/caseload')
    })
  })

  describe('POST', () => {
    it('Should accept valid Team Code and redirect to team caseload page', async () => {
      req.body.teams = ['ABCDE']
      await handler.POST()(req, res, next)
      expect(req.session.teamSelection).toEqual(['ABCDE'])
      expect(res.redirect).toBeCalledWith('/licence/create/caseload?view=team')
    })

    it('Should not accept invalid Team Code and display error message', async () => {
      await handler.POST()(req, res, next)
      expect(req.session.teamSelection).toEqual(null)
      expect(res.render).toBeCalledWith('pages/changeTeam', {
        probationTeams,
        checked: null,
        validationErrors: [{ field: 'teams', message: 'Select the team you wish to view cases for' }],
      })
    })
  })
})
