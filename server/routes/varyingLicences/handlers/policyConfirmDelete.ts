import { Request, Response } from 'express'

export default class PolicyConfirmDelete {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId, changeCounter } = req.params

    const conditionText = req.session.changedConditions[+changeCounter - 1].previousText

    return res.render('pages/vary/policyConfirmDelete', { licenceId, changeCounter, conditionText })
  }
}
