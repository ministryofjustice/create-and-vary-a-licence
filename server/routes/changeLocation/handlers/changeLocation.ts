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
      const queryTerm = req.query?.queryTerm as string
      let cancelLink

      if (role === AuthRole.CASE_ADMIN) {
        if (queryTerm) {
          cancelLink = `/search/ca-search?queryTerm=${queryTerm}`
        } else if (req.query?.view) {
          cancelLink = '/licence/view/cases?view=probation'
        } else {
          cancelLink = '/licence/view/cases'
        }
      } else {
        cancelLink = `/licence/approve/cases${req.query?.approval ? `?approval=${req.query?.approval}` : ''}`
      }
      res.render('pages/changeLocation', { caseload, checked, cancelLink })
    }
  }

  public POST(role: AuthRole.CASE_ADMIN | AuthRole.DECISION_MAKER): RequestHandler {
    return async (req, res) => {
      req.session.caseloadsSelected = req.body?.caseload
      const queryTerm = req.query?.queryTerm as string
      let nextPage

      if (role === AuthRole.CASE_ADMIN) {
        if (queryTerm) {
          nextPage = `/search/ca-search?queryTerm=${queryTerm}`
        } else if (req.query?.view) {
          nextPage = '/licence/view/cases?view=probation'
        } else {
          nextPage = '/licence/view/cases'
        }
      } else {
        nextPage = `/licence/approve/cases${req.query?.approval ? `?approval=${req.query?.approval}` : ''}`
      }

      res.redirect(nextPage)
    }
  }
}
