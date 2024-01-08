import { RequestHandler } from 'express'
import UserService from '../../../services/userService'
import AuthRole from '../../../enumeration/authRole'

export default class ChangeLocationRoutes {
  constructor(private readonly userService: UserService) {}

  public GET(role: AuthRole.CASE_ADMIN | AuthRole.DECISION_MAKER): RequestHandler {
    return async (req, res) => {
      const { user } = res.locals
      const prisonCaseloadFromNomis = await this.userService.getPrisonUserCaseloads(user)
      const caseload = prisonCaseloadFromNomis.map(c => ({ value: c.caseLoadId, text: c.description }))
      const checked = req.session.caseloadsSelected

      let cancelLink = req.query.view ? '/licence/view/cases?view=probation' : '/licence/view/cases'
      if (role !== AuthRole.CASE_ADMIN) {
        cancelLink = req.query.approval
          ? `/licence/approve/cases?approval=${req.query.approval}`
          : '/licence/approve/cases'
      }
      res.render('pages/changeLocation', { caseload, checked, cancelLink })
    }
  }

  public POST(role: AuthRole.CASE_ADMIN | AuthRole.DECISION_MAKER): RequestHandler {
    return async (req, res) => {
      req.session.caseloadsSelected = req.body.caseload
      const returnToUrl = req.query.view ? '/licence/view/cases?view=probation' : '/licence/view/cases'
      const nextPage =
        role === AuthRole.CASE_ADMIN
          ? returnToUrl
          : `/licence/approve/cases${req.query.approval ? `?approval=${req.query.approval}` : ''}`
      res.redirect(nextPage)
    }
  }
}
