import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import LicenceType from '../../../enumeration/licenceType'
import type BespokeConditions from '../types/bespokeConditions'
import type { BespokeCondition } from '../../../@types/licenceApiClientTypes'

export default class BespokeConditionsRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const conditionsList = res.locals?.licence?.bespokeConditions || ([] as BespokeCondition[])
    const conditions: string[] = conditionsList?.length > 0 ? conditionsList.map(c => c.text) : []
    res.render('pages/create/bespokeConditions', { conditions })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    // TODO: Some work to do here to redirect to the same page if "Add another" or "Remove" is selected and javascript is off
    const { licenceId } = req.params
    const { licence } = res.locals
    const { user } = res.locals

    await this.licenceService.updateBespokeConditions(licenceId, req.body, user)

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
    }

    if (licence.typeCode === LicenceType.PSS || licence.typeCode === LicenceType.AP_PSS) {
      return res.redirect(`/licence/create/id/${licenceId}/additional-pss-conditions-question`)
    }

    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }

  DELETE = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { user } = res.locals
    await this.licenceService.updateBespokeConditions(licenceId, { conditions: [] } as BespokeConditions, user)
    return res.redirect(`/licence/create/id/${licenceId}/check-your-answers`)
  }
}
