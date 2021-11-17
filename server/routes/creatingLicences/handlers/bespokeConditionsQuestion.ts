import { Request, Response } from 'express'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceType from '../../../enumeration/licenceType'

export default class BespokeConditionsQuestionRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/create/bespokeConditionsQuestion')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { licence } = res.locals
    if (answer === YesOrNo.YES) {
      return res.redirect(`/licence/create/id/${licenceId}/bespoke-conditions`)
    }

    if (licence.typeCode === LicenceType.PSS || licence.typeCode === LicenceType.AP_PSS) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-pss-conditions-question`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
