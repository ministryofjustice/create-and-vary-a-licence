import { Request, Response } from 'express'
import _ from 'lodash'
import YesOrNo from '../../../enumeration/yesOrNo'
import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { isInPssPeriod } from '../../../utils/utils'

export default class ConfirmVaryActionRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const inPssPeriod = isInPssPeriod(licence)
    res.render('pages/vary/confirmVaryQuestion', { inPssPeriod, licence })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { answer } = req.body
    const { user, licence } = res.locals

    if (answer === YesOrNo.NO) {
      return res.redirect(`/licence/vary/id/${licenceId}/view-active`)
    }

    let newLicence: LicenceSummary
    const licenceVariations = await this.licenceService.getIncompleteLicenceVariations(licence.nomsId)
    if (licenceVariations?.length > 0) {
      newLicence = _.head(licenceVariations)
    } else {
      newLicence = await this.licenceService.createVariation(licenceId, user)
    }

    return res.redirect(`/licence/vary/id/${newLicence.licenceId}/spo-discussion`)
  }
}
