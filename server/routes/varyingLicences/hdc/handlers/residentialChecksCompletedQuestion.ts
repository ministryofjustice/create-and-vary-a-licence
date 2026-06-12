import { Request, Response } from 'express'
import YesOrNo from '../../../../enumeration/yesOrNo'
import HdcCurfewAddressService from '../../../../services/hdc/hdcCurfewAddressService'

export default class ResidentialChecksCompletedQuestionRoutes {
  constructor(private readonly hdcCurfewAddressService: HdcCurfewAddressService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/vary/hdc/residentialChecksCompletedQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence, user } = res.locals
    const { answer } = req.body
    const fromReview = Boolean(req.query?.fromReview)

    const isYes = answer === YesOrNo.YES
    const redirectParam = fromReview ? '?fromReview=true' : ''

    req.session.curfewAddressChecksCompleted = isYes

    if (!isYes) {
      return res.redirect(`/licence/vary/id/${licence.id}/hdc/residential-checks-incomplete${redirectParam}`)
    }

    req.session.curfewAddressChecksIncompleteReason = null

    if (fromReview) {
      await this.hdcCurfewAddressService.updateResidentialChecks(licence, true, null, user)
    }

    const redirectUrl = fromReview
      ? `/licence/create/id/${licence.id}/check-your-answers`
      : `/licence/vary/id/${licence.id}/hdc/find-the-new-curfew-address`

    return res.redirect(redirectUrl)
  }
}
