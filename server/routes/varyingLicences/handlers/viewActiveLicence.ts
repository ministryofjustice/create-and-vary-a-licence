import { Request, Response } from 'express'
import { expandAdditionalConditions } from '../../../utils/conditionsProvider'

export default class ViewActiveLicenceRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const expandedLicenceConditions = expandAdditionalConditions(licence.additionalLicenceConditions)
    const expandedPssConditions = expandAdditionalConditions(licence.additionalPssConditions)
    res.render('pages/vary/viewActive', { expandedLicenceConditions, expandedPssConditions })
  }
}
