import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import YesOrNo from '../../../../enumeration/yesOrNo'
import { AdditionalCondition, Licence } from '../../../../@types/licenceApiClientTypes'

export default class OutOfBoundsPremisesRemovalRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  private getLicenceCondition = (conditionId: number, licence: Licence): AdditionalCondition | null => {
    const condition = licence.additionalLicenceConditions.find((c: AdditionalCondition) => c.id === conditionId)
    return condition || null
  }

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { conditionId } = req.params

    const condition = this.getLicenceCondition(parseInt(conditionId, 10), licence)

    let description = ''
    if (condition?.data?.length) {
      const { field, value } = condition.data[0]
      description = field !== 'premisesAddress' ? value : value.split(',')[0]
    }

    res.render('pages/manageConditions/outOfBoundsPremises/confirmPremisesDeletion', {
      conditionId,
      conditionCode: condition.code,
      displayMessage: null,
      description,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user, licence } = res.locals
    const { conditionId } = req.params
    const { confirmRemoval } = req.body

    if (!confirmRemoval) {
      const condition = this.getLicenceCondition(parseInt(conditionId, 10), licence)
      const displayMessage = { text: 'Select yes or no' }
      return res.render('pages/manageConditions/outOfBoundsPremises/confirmPremisesDeletion', {
        conditionId,
        conditionCode: condition.code,
        displayMessage,
        description: condition.data[0].value,
      })
    }

    if (confirmRemoval === YesOrNo.YES) {
      await this.licenceService.deleteAdditionalCondition(parseInt(conditionId, 10), licence.id, user)
    }

    const condition = this.getLicenceCondition(parseInt(conditionId, 10), licence)

    return res.redirect(
      `/licence/create/id/${licence.id}/additional-licence-conditions/condition/${condition.code}/outofbounds-premises?fromReview=true`
    )
  }
}
