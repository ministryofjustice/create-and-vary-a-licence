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

      if (Array.isArray(teamCode) && teamCode.length > 0) {
        req.session.teamSelection = teamCode
        res.redirect(this.getBackLink(req.route.path, !!teamCode))
        return
      }

      this.render(req, res, [{ field: 'teams', message: 'Select the team you wish to view cases for' }])
    }
  }

  private render(req: Request, res: Response, validationErrors?: [{ field: string; message: string }] | []) {
    const { user } = res.locals
    const { probationTeams } = user

    /*
     * Not a valid page if user has only one team. Redirect to users caseload page.
     * Avoid redirect to team page, just in case a redirect loop is introduced from the team page to here.
     */
    if (!Array.isArray(probationTeams) || probationTeams.length === 1) {
      res.redirect('/licence/create/caseload')
      return
    }

    const checked = req.session.teamSelection
    const backLinkHref = this.getBackLink(req.route.path, !!checked)

    res.render('pages/changeTeam', { probationTeams, checked, validationErrors, backLinkHref })
  }

  private getBackLink = (route: string, hasSelectedTeam: boolean) => {
    const tab = hasSelectedTeam ? '?view=team' : ''
    return route === '/licence/create/caseload/change-team'
      ? `/licence/create/caseload${tab}`
      : `/licence/vary/caseload${tab}`
  }
}
