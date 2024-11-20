import { Request, Response } from 'express'

export default class PolicyChangesCallbackRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    req.session.changedConditionsCounter += 1
    const policyChangesCount = req.session.changedConditions.length

    if (req.session.changedConditionsCounter > policyChangesCount) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    return res.redirect(
      `/licence/vary/id/${licenceId}/policy-changes/condition/${req.session.changedConditionsCounter}`,
    )
  }
}
