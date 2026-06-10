import { Request, Response } from 'express'
import YesOrNo from '../../../../enumeration/yesOrNo'

export default class ResidentialChecksCompletedQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/residentialChecksCompletedQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { answer } = req.body
    const { licenceId } = req.params
    const isYes = answer === YesOrNo.YES

    req.session.curfewAddressChecksCompleted = isYes

    if (isYes) {
      req.session.curfewAddressChecksIncompleteReason = null
      return res.redirect(`/licence/vary/id/${licenceId}/hdc/find-the-new-curfew-address`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/hdc/residential-checks-incomplete`)
  }
}
