import { Request, Response } from 'express'
import LicenceService from '../../../services/licenceService'
import CommunityService from '../../../services/communityService'

export default class CaseloadRoutes {
  constructor(private readonly licenceService: LicenceService, private readonly communityService: CommunityService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const staffId = 2500012436 // TODO: This needs to be looked up in delius using res.locals.user.username
    const managedOffenders = await this.communityService.getManagedOffenders(staffId)
    const caseload = managedOffenders
      .filter(offender => !offender.currentOm) // TODO: This should be (offender => offender.currentOm) but until we have a delius user to use, we need to negate this clause for now
      .map(offender => {
        return {
          name: offender.offenderSurname,
          crnNumber: offender.crnNumber,
          conditionalReleaseDate: '03 August 2022', // TODO: Get conditionalReleaseDate from nomis??
        }
      })
    res.render('pages/create/caseload', { caseload })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { username } = res.locals.user
    // TODO: Populate licence with real data from nomis/delius
    const { licenceId } = await this.licenceService.createLicence(username)
    res.redirect(`/licence/create/id/${licenceId}/initial-meeting-name`)
  }
}
