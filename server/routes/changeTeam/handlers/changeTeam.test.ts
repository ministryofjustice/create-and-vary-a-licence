import ChangeTeamRoutes from './changeTeam'
import ComCaseloadService from '../../../services/lists/comCaseloadService'
import { createRequestAndResponse, createProbationUser } from '../../../testUtils/handlerTestUtils'

const comCaseloadService = new ComCaseloadService(null, null) as jest.Mocked<ComCaseloadService>

jest.mock('../../../services/lists/comCaseloadService')

describe('Route Handlers - ChangeLocationRoutes', () => {
  const handler = new ChangeTeamRoutes(comCaseloadService, 'create')

  const probationTeams = [
    { code: 'ABC', label: 'Team One', count: 0 },
    { code: 'ABCD', label: 'Team Two', count: 0 },
    { code: 'ABCDE', label: 'Team Three', count: 0 },
  ]

  beforeEach(() => {
    comCaseloadService.getComReviewCount.mockResolvedValue({
      myCount: 1,
      teams: [
        { teamCode: 'ABC', count: 3 },
        { teamCode: 'teamB', count: 1 },
      ],
    })
  })

  describe('GET', () => {
    it('Should list all teams with no selected team', async () => {
      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: null },
          route: { path: '/licence/create/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams }) },
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

    it('Should list all teams with active team', async () => {
      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: ['ABCD'] },
          route: { path: '/licence/create/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams }) },
      })

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
      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: null },
          route: { path: '/licence/create/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams: [{ code: 'ABC', label: 'Team One' }] }) },
      })

      await handler.GET()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/caseload')
    })

    it('Should list all teams with no selected team and showTeamsCount false', async () => {
      comCaseloadService.getComReviewCount.mockResolvedValue({
        myCount: 1,
        teams: [
          { teamCode: 'teamA', count: 3 },
          { teamCode: 'teamB', count: 1 },
        ],
      })

      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: null },
          route: { path: '/licence/create/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams }) },
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
      const varyHandler = new ChangeTeamRoutes(comCaseloadService, 'vary')
      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: ['ABCD'] },
          route: { path: '/licence/vary/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams }) },
      })

      await varyHandler.GET()(req, res, next)

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
      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: null },
          body: { teams: ['ABCDE'] },
          route: { path: '/licence/create/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams }) },
      })

      await handler.POST()(req, res, next)
      expect(req.session.teamSelection).toEqual(['ABCDE'])
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/caseload?view=team')
    })

    it('Should not accept missing Team Code and display error message', async () => {
      const { req, res, next } = createRequestAndResponse({
        req: {
          session: { teamSelection: null },
          body: { teams: [] },
          route: { path: '/licence/create/caseload/change-team' },
        },
        res: { user: createProbationUser({ probationTeams }) },
      })

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
