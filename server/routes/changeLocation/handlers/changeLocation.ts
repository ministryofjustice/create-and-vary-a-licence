import { Request, Response } from 'express'
import UserService from '../../../services/userService'

export default class ChangeLocationRoutes {
  constructor(private readonly userService: UserService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const prisonCaseloadFromNomis = await this.userService.getPrisonUserCaseloads(user)
    const caseload = prisonCaseloadFromNomis.map(c => ({ value: c.caseLoadId, text: c.description }))
    const checked = req.session.caseloadsSelected

    res.render('pages/changeLocation', { caseload, checked })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    req.session.caseloadsSelected = req.body.caseload
    return res.redirect('/licence/view/cases')
  }
}
