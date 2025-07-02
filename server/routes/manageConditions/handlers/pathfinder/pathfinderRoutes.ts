import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import { UpdateElectronicMonitoringProgrammeRequest } from '../../../../@types/licenceApiClientTypes'

export default class PathfinderRoutes {
  constructor(private readonly licenceService: LicenceService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    return res.render('pages/manageConditions/pathfinder/input')
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { licence } = res.locals
    const { isToBeTaggedForProgramme, programmeName } = req.body

    await this.licenceService.updateElectronicMonitoringProgramme(licence.id, {
      isToBeTaggedForProgramme: isToBeTaggedForProgramme === 'Yes',
      programmeName: isToBeTaggedForProgramme === 'Yes' ? programmeName : null,
    } as UpdateElectronicMonitoringProgrammeRequest)

    if (req.query?.fromReview) {
      return res.redirect(`/licence/create/id/${licence.id}/check-your-answers`)
    }

    return res.redirect(`/licence/create/id/${licence.id}/bespoke-conditions-question`)
  }
}
