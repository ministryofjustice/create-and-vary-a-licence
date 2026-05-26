import { Request, Response } from 'express'
import YesOrNo from '../../../../enumeration/yesOrNo'

export default class ResidentialChecksCompletedQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/residentialChecksCompletedQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { answer } = req.body
    const { licenceId } = req.params

    if (answer === YesOrNo.YES) {
      req.session.curfewAddressChecksIncompleteReason = null
      return res.redirect(`/licence/vary/id/${licenceId}/hdc/find-address`)
    }

    return res.redirect(`/licence/vary/id/${licenceId}/hdc/residential-checks-incomplete`)
  }
}
