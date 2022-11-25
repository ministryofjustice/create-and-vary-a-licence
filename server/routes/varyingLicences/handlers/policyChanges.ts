import { Response, Request } from 'express'
import Converter from 'number-to-words'
import { LicenceConditionChange } from '../../../@types/licenceApiClientTypes'
import LicenceService from '../../../services/licenceService'
import { convertToTitleCase } from '../../../utils/utils'

export default class PolicyChangesNoticeRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    const changedConditions = await this.licenceService.getPolicyChanges(licenceId)
    const numberOfChanges = convertToTitleCase(Converter.toWords(changedConditions.length))

    req.session.changedConditions = changedConditions.sort((a: LicenceConditionChange, b: LicenceConditionChange) => {
      if (['REPLACED', 'DELETED'].includes(a.changeType)) {
        return -1
      }
      return a.sequence > b.sequence ? 1 : -1
    })
    req.session.changedConditionsCounter = 0

    res.render('pages/vary/policyChanges', { numberOfChanges })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params

    return res.redirect(`/licence/vary/id/${licenceId}/policy-changes/callback`)
  }
}
