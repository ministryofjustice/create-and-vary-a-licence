import { RequestHandler, Request, Response } from 'express'
import CaseloadService from '../../../services/caseloadService'

export default class ChangeTeamRoutes {
  constructor(private readonly caseloadService: CaseloadService) {}

  public GET(): RequestHandler {
    return async (req, res) => {
      await this.render(req, res, [])
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

      await this.render(req, res, [{ field: 'teams', message: 'Select the team you wish to view cases for' }])
    }
  }

  private async render(req: Request, res: Response, validationErrors?: [{ field: string; message: string }] | []) {
    const { user } = res.locals
    const { probationTeams } = user
    const { teams } = await this.caseloadService.getComReviewCount(user)

    const probationTeamsWithCount = probationTeams.map(probationTeam => {
      return {
        ...probationTeam,
        count: req.route.path.includes('create') ? 0 : teams.find(t => t.teamCode === probationTeam.code)?.count || 0,
      }
    })
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
    const showTeamsCount = probationTeamsWithCount.some(t => t.count)

    res.render('pages/changeTeam', {
      probationTeamsWithCount,
      checked,
      validationErrors,
      backLinkHref,
      showTeamsCount,
    })
  }

  private getBackLink = (route: string, hasSelectedTeam: boolean) => {
    const tab = hasSelectedTeam ? '?view=team' : ''
    return route === '/licence/create/caseload/change-team'
      ? `/licence/create/caseload${tab}`
      : `/licence/vary/caseload${tab}`
  }
}
