import { RequestHandler, Request, Response } from 'express'

export default class ChangeTeamRoutes {
  public GET(): RequestHandler {
    return async (req, res) => {
      this.render(req, res, [])
    }
  }

  public POST(): RequestHandler {
    return async (req, res) => {
      const teamCode = req.body.teams

      if (teamCode) {
        req.session.teamSelection = teamCode
        res.redirect('/licence/create/caseload?view=team')
        return
      }

      this.render(req, res, [{ field: 'teams', message: 'Select the team you wish to view cases for' }])
    }
  }

  private render(req: Request, res: Response, validationErrors?: [{ field: string; message: string }] | []) {
    const { user } = res.locals
    const { probationTeams } = user
    const checked = req.session.teamSelection
    res.render('pages/changeTeam', { probationTeams, checked, validationErrors })
  }
}
