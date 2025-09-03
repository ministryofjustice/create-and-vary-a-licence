import { RequestHandler, Request } from 'express'
import UserService from '../../../services/userService'
import AuthRole from '../../../enumeration/authRole'

export default class ChangeLocationRoutes {
  constructor(private readonly userService: UserService) {}

  private getReturnLink = (role: AuthRole.CASE_ADMIN | AuthRole.DECISION_MAKER, req: Request): string => {
    let returnLink
    if (role === AuthRole.CASE_ADMIN) {
      if (req.query?.queryTerm) {
        returnLink = `/search/ca-search?queryTerm=${req.query?.queryTerm}`
      } else if (req.query?.view) {
        returnLink = '/licence/view/cases?view=probation'
      } else {
        returnLink = '/licence/view/cases'
      }
    } else if (role === AuthRole.DECISION_MAKER && req.query?.queryTerm) {
      returnLink = `/search/approver-search?queryTerm=${req.query?.queryTerm}`
    } else {
      returnLink = `/licence/approve/cases${req.query?.approval ? `?approval=${req.query?.approval}` : ''}`
    }
    return returnLink
  }

  public GET(role: AuthRole.CASE_ADMIN | AuthRole.DECISION_MAKER): RequestHandler {
    return async (req, res) => {
      const { user } = res.locals
      const prisonCaseloadFromNomis = await this.userService.getPrisonUserCaseloads(user)
      const caseload = prisonCaseloadFromNomis.map(c => ({ value: c.caseLoadId, text: c.description }))
      const checked = req.session.caseloadsSelected
      const cancelLink = this.getReturnLink(role, req)

      res.render('pages/changeLocation', { caseload, checked, cancelLink })
    }
  }

  public POST(role: AuthRole.CASE_ADMIN | AuthRole.DECISION_MAKER): RequestHandler {
    return async (req, res) => {
      req.session.caseloadsSelected = req.body?.caseload

      req.session.currentUser = {
        ...req.session.currentUser,
        hasSelectedMultiplePrisonCaseloads: req.session.caseloadsSelected.length > 1,
        prisonCaseloadToDisplay: req.session.caseloadsSelected.length
          ? req.session.caseloadsSelected
          : [res.locals.user.activeCaseload],
      }

      const nextPage = this.getReturnLink(role, req)

      res.redirect(nextPage)
    }
  }
}
